import { writeFile } from 'node:fs/promises'

const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:8080'
const target = new URL('../openapi.json', import.meta.url)

const response = await fetch(`${apiUrl}/v3/api-docs`).catch((error) => {
  console.error(`Cannot reach the backend at ${apiUrl}: is it running?`)
  throw error
})
if (!response.ok) {
  throw new Error(`The backend answered HTTP ${response.status} for /v3/api-docs`)
}
const spec = await response.json()
await writeFile(target, `${JSON.stringify(spec, null, 2)}\n`)
console.log(`Saved the OpenAPI contract of ${apiUrl} to openapi.json`)
