import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

const TABLES = [
  'profiles',
  'projects',
  'tasks',
  'task_agent_runs',
  'task_comments',
  'chat_messages',
  'shared_emails',
  'email_accounts',
  'calendar_events',
  'student_codes',
  'course_registrations',
  'waitlist_leads',
  'knowledge_items',
  'marketing_campaigns',
  'student_missions',
  'student_certificates',
  'files'
];

async function runBackup() {
  const backupDir = path.resolve(process.cwd(), 'supabase/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup_data_${timestamp}.json`);
  const sqlFile = path.join(backupDir, `backup_data_${timestamp}.sql`);

  console.log(`Starting backup of ${TABLES.length} tables...`);
  const exportData = {};
  let totalRows = 0;
  const sqlStatements = [];

  for (const table of TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' });

      if (error) {
        console.warn(`[SKIP/WARN] Table ${table}: ${error.message}`);
        continue;
      }

      exportData[table] = data || [];
      const rowCount = data ? data.length : 0;
      totalRows += rowCount;
      console.log(`✓ Table ${table}: ${rowCount} records`);

      if (data && data.length > 0) {
        for (const row of data) {
          const keys = Object.keys(row);
          const values = keys.map(k => {
            const v = row[k];
            if (v === null || v === undefined) return 'NULL';
            if (typeof v === 'number' || typeof v === 'boolean') return v;
            if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
            return `'${String(v).replace(/'/g, "''")}'`;
          });
          sqlStatements.push(`INSERT INTO public.${table} (${keys.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;`);
        }
      }
    } catch (err) {
      console.error(`Error dumping table ${table}:`, err.message);
    }
  }

  fs.writeFileSync(backupFile, JSON.stringify(exportData, null, 2), 'utf8');
  fs.writeFileSync(sqlFile, sqlStatements.join('\n'), 'utf8');

  console.log(`\n🎉 Backup complete!`);
  console.log(`- Total records exported: ${totalRows}`);
  console.log(`- JSON dump: ${backupFile}`);
  console.log(`- SQL insert dump: ${sqlFile}`);
}

runBackup();
