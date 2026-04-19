import fs from 'fs/promises'
import path from 'path'

const BASE = process.env.SEED_BASE_URL || 'http://localhost:3003'
const EMAIL = process.env.SEED_EMAIL || 'admin@local.test'
const PASSWORD = process.env.SEED_PASSWORD || 'admin12345'

const MAPPING: { slug: string; file: string; name: string }[] = [
  {
    slug: 'checklists-cabina',
    file: 'checklist-la-herramienta-más infravalorada.png',
    name: 'checklists-cabina.png',
  },
  {
    slug: 'viento-cruzado',
    file: 'El arte de aterrizar con viento cruzado.png',
    name: 'viento-cruzado.png',
  },
  {
    slug: 'navegacion-atlantico-astros',
    file: 'Navegación estelar sin tecnología.png',
    name: 'navegacion-atlantico-astros.png',
  },
]

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const data = await res.json()
  if (!data.token) throw new Error(`Login failed: ${JSON.stringify(data)}`)
  return data.token as string
}

async function uploadMedia(token: string, filePath: string, alt: string, filename: string): Promise<number> {
  const buffer = await fs.readFile(filePath)
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('_payload', JSON.stringify({ alt }))

  const res = await fetch(`${BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  const data = await res.json()
  if (!data.doc?.id) throw new Error(`Upload failed: ${JSON.stringify(data)}`)
  return data.doc.id as number
}

async function main() {
  const token = await login()

  for (const entry of MAPPING) {
    const findRes = await fetch(
      `${BASE}/api/posts?where[slug][equals]=${entry.slug}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } },
    )
    const findData = await findRes.json()
    const post = findData.docs?.[0]
    if (!post) {
      console.warn(`! post not found: ${entry.slug}`)
      continue
    }

    const abs = path.resolve(entry.file)
    const mediaId = await uploadMedia(token, abs, post.title, entry.name)

    const updateRes = await fetch(`${BASE}/api/posts/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({ featuredImage: mediaId }),
    })
    const updateData = await updateRes.json()
    if (updateData.errors) {
      console.error(`! update failed ${entry.slug}:`, JSON.stringify(updateData))
      continue
    }
    console.log(`+ updated "${entry.slug}" → media ${mediaId}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
