import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Errore: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti in .env.local')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

async function addTeamUser() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.log('Utilizzo: npx tsx scripts/add-team-user.js <email> <password>')
    console.log('Esempio: npx tsx scripts/add-team-user.js mario.rossi@azienda.it Password123!')
    process.exit(1)
  }

  console.log(`Creazione nuovo membro team per: ${email}...`)

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
  })

  if (error) {
    console.error('❌ Errore durante la creazione dell\'utente:', error.message)
    process.exit(1)
  }

  console.log(`✅ Membro del team creato con successo!`)
  console.log(`ID Utente: ${data.user.id}`)
  console.log(`Email: ${data.user.email}`)
}

addTeamUser()
