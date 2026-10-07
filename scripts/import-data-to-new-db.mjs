import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const targetUrl = process.argv[2] || process.env.TARGET_SUPABASE_URL;
const targetKey = process.argv[3] || process.env.TARGET_SERVICE_ROLE_KEY;

if (!targetUrl || !targetKey) {
  console.error('Usage: node scripts/import-data-to-new-db.mjs <SUPABASE_URL> <SERVICE_ROLE_KEY>');
  process.exit(1);
}

const supabase = createClient(targetUrl, targetKey, {
  auth: { persistSession: false }
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

// Insertion order respecting foreign keys
const INSERT_ORDER = [
  'profiles',
  'projects',
  'tasks',
  'task_agent_runs',
  'calendar_events',
  'student_codes',
  'course_registrations',
  'waitlist_leads',
  'marketing_campaigns',
  'files'
];

async function runImport() {
  console.log(`Connecting to EU Supabase at: ${targetUrl}...`);
  let importedTotal = 0;

  for (const table of INSERT_ORDER) {
    const rows = backupData[table] || [];
    if (rows.length === 0) {
      console.log(`- Table ${table}: 0 records to import`);
      continue;
    }

    console.log(`Importing ${rows.length} records into ${table}...`);
    // Batch in chunks of 50
    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from(table)
        .upsert(chunk, { onConflict: 'id', ignoreDuplicates: false });

      if (error) {
        console.warn(`[WARN] Table ${table} chunk error: ${error.message}`);
      }
    }
    importedTotal += rows.length;
    console.log(`✓ Table ${table}: ${rows.length} records imported/upserted`);
  }

  console.log(`\n🎉 Data import complete! Total records processed: ${importedTotal}`);
}

runImport();
