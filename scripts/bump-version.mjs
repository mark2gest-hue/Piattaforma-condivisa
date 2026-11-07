import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const versionFilePath = path.join(rootDir, 'version.json')
const packageFilePath = path.join(rootDir, 'package.json')

const rawVersion = fs.readFileSync(versionFilePath, 'utf8')
const data = JSON.parse(rawVersion)

const flag = (process.argv[2] || '').toLowerCase()

const currentVersion = data.version || '1.0.0'
const parts = currentVersion.split('.').map((n) => parseInt(n, 10) || 0)
let major = parts[0] || 1
let minor = parts[1] || 0
let patch = parts[2] || 0

// 3 Livelli di Versionamento:
// 1. Modifica Strutturale (DB schema, RLS, integrazioni esterne, architettura): salto major X+1.0.0
// 2. Modifica Interfaccia / Nuova Funzione (UI, selettori, componenti, flow utente): salto minor x.Y+1.0
// 3. Sistemazione / Bugfix puntuale: solo build +1 (o patch x.y.Z+1 se esplicitamente richiesto)
if (flag === '--structural' || flag === '--major') {
  major += 1
  minor = 0
  patch = 0
  data.version = `${major}.${minor}.${patch}`
} else if (flag === '--mod' || flag === '--ui' || flag === '--minor') {
  minor += 1
  patch = 0
  data.version = `${major}.${minor}.${patch}`
} else if (flag === '--patch') {
  patch += 1
  data.version = `${major}.${minor}.${patch}`
}

// In tutti i casi la build incrementa sempre di +1
data.build = (Number(data.build) || 0) + 1
data.updatedAt = new Date().toISOString()

fs.writeFileSync(versionFilePath, JSON.stringify(data, null, 2) + '\n', 'utf8')

// Sincronizza sempre la versione anche in package.json
if (fs.existsSync(packageFilePath)) {
  const rawPkg = fs.readFileSync(packageFilePath, 'utf8')
  const pkg = JSON.parse(rawPkg)
  pkg.version = data.version
  fs.writeFileSync(packageFilePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
}

console.log(`[VersionBump] v${data.version} • Build #${data.build} (${data.updatedAt}) [mode: ${flag || 'build-only'}]`)
