import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const versionFilePath = path.join(__dirname, '..', 'version.json')

const raw = fs.readFileSync(versionFilePath, 'utf8')
const data = JSON.parse(raw)

data.build = (Number(data.build) || 0) + 1
data.updatedAt = new Date().toISOString()

fs.writeFileSync(versionFilePath, JSON.stringify(data, null, 2) + '\n', 'utf8')

console.log(`Build bumped to v${data.version} • Build #${data.build} (${data.updatedAt})`)
