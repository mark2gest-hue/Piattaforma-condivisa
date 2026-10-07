import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const targetUrl = process.argv[2] || process.env.TARGET_SUPABASE_URL;
const targetKey = process.argv[3] || process.env.TARGET_SERVICE_ROLE_KEY;

if (!targetUrl || !targetKey) {
  console.error('Usage: node scripts/complete-migration.mjs <SUPABASE_URL> <SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(targetUrl, targetKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const backupDir = path.resolve(process.cwd(), 'supabase/backups');
const files = fs.readdirSync(backupDir).filter(f => f.startsWith('backup_data_') && f.endsWith('.json')).sort();
if (files.length === 0) {
  console.error('No backup JSON found in supabase/backups');
  process.exit(1);
}

const latestBackup = path.join(backupDir, files[files.length - 1]);
console.log(`Loading backup data from: ${latestBackup}`);
const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));

async function main() {
  console.log(`\n1. Creating/Syncing Auth Users in ${targetUrl}...`);
  const profiles = backupData.profiles || [];

  for (const prof of profiles) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        id: prof.id,
        email: prof.email,
        email_confirm: true,
        user_metadata: { full_name: prof.full_name },
        password: 'TemporaryPassword2026!'
      });

      if (error && !error.message.includes('already exists') && !error.message.includes('duplicate key')) {
        console.warn(`[WARN] Auth user creation for ${prof.email}: ${error.message}`);
      } else {
        console.log(`✓ Auth user created/confirmed: ${prof.email} (${prof.id})`);
      }
    } catch (err) {
      console.warn(`[WARN] Error on auth user ${prof.email}:`, err.message);
    }
  }

  console.log(`\n2. Importing Profiles...`);
  const { error: profErr } = await supabase.from('profiles').upsert(profiles, { onConflict: 'id' });
  if (profErr) {
    console.error('Error importing profiles:', profErr.message);
  } else {
    console.log(`✓ Profiles imported successfully (${profiles.length} records)`);
  }

  console.log(`\n3. Importing Projects...`);
  if (backupData.projects && backupData.projects.length > 0) {
    const { error: projErr } = await supabase.from('projects').upsert(backupData.projects, { onConflict: 'id' });
    if (projErr) console.error('Error importing projects:', projErr.message);
    else console.log(`✓ Projects imported (${backupData.projects.length} records)`);
  }

  console.log(`\n4. Importing Tasks...`);
  if (backupData.tasks && backupData.tasks.length > 0) {
    const { error: taskErr } = await supabase.from('tasks').upsert(backupData.tasks, { onConflict: 'id' });
    if (taskErr) console.error('Error importing tasks:', taskErr.message);
    else console.log(`✓ Tasks imported (${backupData.tasks.length} records)`);
  }

  console.log(`\n5. Importing Calendar Events...`);
  if (backupData.calendar_events && backupData.calendar_events.length > 0) {
    const { error: calErr } = await supabase.from('calendar_events').upsert(backupData.calendar_events, { onConflict: 'id' });
    if (calErr) console.error('Error importing calendar_events:', calErr.message);
    else console.log(`✓ Calendar events imported (${backupData.calendar_events.length} records)`);
  }

  console.log(`\n6. Importing Student Codes...`);
  if (backupData.student_codes && backupData.student_codes.length > 0) {
    // Sanitize in case column expires_at is not in schema
    const sanitizedCodes = backupData.student_codes.map(sc => {
      const { expires_at, ...rest } = sc;
      return rest;
    });
    const { error: codeErr } = await supabase.from('student_codes').upsert(sanitizedCodes, { onConflict: 'id' });
    if (codeErr) console.error('Error importing student_codes:', codeErr.message);
    else console.log(`✓ Student codes imported (${sanitizedCodes.length} records)`);
  }

  console.log(`\n7. Importing Course Registrations...`);
  if (backupData.course_registrations && backupData.course_registrations.length > 0) {
    const { error: regErr } = await supabase.from('course_registrations').upsert(backupData.course_registrations, { onConflict: 'id' });
    if (regErr) console.error('Error importing course_registrations:', regErr.message);
    else console.log(`✓ Course registrations imported (${backupData.course_registrations.length} records)`);
  }

  console.log(`\n8. Importing Waitlist Leads...`);
  if (backupData.waitlist_leads && backupData.waitlist_leads.length > 0) {
    const { error: leadErr } = await supabase.from('waitlist_leads').upsert(backupData.waitlist_leads, { onConflict: 'id' });
    if (leadErr) console.error('Error importing waitlist_leads:', leadErr.message);
    else console.log(`✓ Waitlist leads imported (${backupData.waitlist_leads.length} records)`);
  }

  console.log(`\n9. Importing Files Metadata...`);
  if (backupData.files && backupData.files.length > 0) {
    const { error: fileErr } = await supabase.from('files').upsert(backupData.files, { onConflict: 'id' });
    if (fileErr) console.error('Error importing files:', fileErr.message);
    else console.log(`✓ Files metadata imported (${backupData.files.length} records)`);
  }

  console.log(`\n========================================`);
  console.log(`VERIFICATION CHECK ON EU SUPABASE`);
  console.log(`========================================`);
  const tablesToCheck = ['profiles', 'projects', 'tasks', 'calendar_events', 'student_codes', 'course_registrations', 'waitlist_leads', 'files'];
  for (const t of tablesToCheck) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) console.log(`Table ${t}: Error (${error.message})`);
    else console.log(`Table ${t}: ${count} records live in EU database`);
  }
}

main();
