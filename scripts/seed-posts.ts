import fs from 'fs/promises'
import path from 'path'

const BASE = process.env.SEED_BASE_URL || 'http://localhost:3003'
const EMAIL = process.env.SEED_EMAIL || 'admin@local.test'
const PASSWORD = process.env.SEED_PASSWORD || 'admin12345'

const SAMPLE_POSTS = [
  {
    title: 'Despegue al amanecer: la rutina del piloto de cabotaje',
    slug: 'despegue-al-amanecer',
    description: 'Un vistazo a la checklist mental y fisica que precede al primer vuelo del dia.',
    category: { slug: 'operaciones', name: 'Operaciones' },
    author: { name: 'Alberto Ruiz', role: 'Piloto comercial' },
    readTime: '6 min',
    body: 'Antes de que el sol despegue sobre la pista, el piloto ya ha revisado NOTAMs, pronosticos y peso y balance. Cada detalle cuenta cuando el primer vuelo marca el ritmo del dia.',
  },
  {
    title: 'De los hermanos Wright al jet supersonico',
    slug: 'wright-al-supersonico',
    description: 'Un recorrido breve por los hitos que transformaron la aviacion en menos de un siglo.',
    category: { slug: 'historia', name: 'Historia' },
    author: { name: 'Marta Lopez', role: 'Historiadora' },
    readTime: '8 min',
    body: 'En 1903 un biplano de madera y tela volo 12 segundos. Sesenta anos despues, el Concorde cruzaba el Atlantico a Mach 2. Esta es la historia condensada de esa aceleracion.',
  },
  {
    title: 'Anatomia de un motor turbofan moderno',
    slug: 'anatomia-turbofan',
    description: 'Como convierten los turbofan el combustible en empuje y por que son tan eficientes a crucero.',
    category: { slug: 'tecnica', name: 'Tecnica' },
    author: { name: 'Javier Soto', role: 'Ingeniero aeronautico' },
    readTime: '10 min',
    body: 'El turbofan mueve grandes masas de aire a baja velocidad. El bypass ratio es la clave: mas bypass, menos consumo, menos ruido. Desglosamos cada etapa.',
  },
  {
    title: 'Cruzando el Atlantico sin GPS: navegacion por astros',
    slug: 'navegacion-atlantico-astros',
    description: 'Como los pilotos de los anos 50 encontraban el camino con un sextante y una tabla de navegacion.',
    category: { slug: 'historia', name: 'Historia' },
    author: { name: 'Marta Lopez', role: 'Historiadora' },
    readTime: '7 min',
    body: 'Antes del INS y el GPS, un navegante con sextante calculaba la posicion tomando referencias del sol, la luna y las estrellas. Un arte que sobrevivio hasta los anos 80.',
  },
  {
    title: 'Checklists: la herramienta mas infravalorada de la cabina',
    slug: 'checklists-cabina',
    description: 'Por que las listas de chequeo son la columna vertebral de la seguridad operacional.',
    category: { slug: 'seguridad', name: 'Seguridad' },
    author: { name: 'Alberto Ruiz', role: 'Piloto comercial' },
    readTime: '5 min',
    body: 'Una checklist no es burocracia: es memoria externa que impide que la rutina se convierta en complacencia. La historia de su adopcion empieza con un B-17 en 1935.',
  },
  {
    title: 'El arte de aterrizar con viento cruzado',
    slug: 'viento-cruzado',
    description: 'Tecnicas crab y sideslip explicadas paso a paso, con sus ventajas y limitaciones.',
    category: { slug: 'tecnica', name: 'Tecnica' },
    author: { name: 'Javier Soto', role: 'Ingeniero aeronautico' },
    readTime: '6 min',
    body: 'Aterrizar con viento cruzado exige alinear el avion con la pista justo antes del toque. Hay dos escuelas: crab hasta el flare o sideslip desde final. Cada una tiene sus trucos.',
  },
]

function lexicalBody(text: string) {
  return {
    root: {
      type: 'root',
      version: 1,
      format: '',
      indent: 0,
      direction: null,
      children: [
        {
          type: 'paragraph',
          version: 1,
          format: '',
          indent: 0,
          direction: 'ltr',
          children: [
            { type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' },
          ],
        },
      ],
    },
  }
}

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

async function findOrCreate(
  token: string,
  collection: string,
  whereField: string,
  whereValue: string,
  createPayload: Record<string, unknown>,
): Promise<number> {
  const url = `${BASE}/api/${collection}?where[${whereField}][equals]=${encodeURIComponent(whereValue)}&limit=1`
  const findRes = await fetch(url, { headers: { Authorization: `JWT ${token}` } })
  const findData = await findRes.json()
  if (findData.docs?.length > 0) return findData.docs[0].id as number

  const createRes = await fetch(`${BASE}/api/${collection}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(createPayload),
  })
  const createData = await createRes.json()
  if (!createData.doc?.id) throw new Error(`Create ${collection} failed: ${JSON.stringify(createData)}`)
  return createData.doc.id as number
}

async function uploadMedia(token: string, filePath: string, alt: string, slug: string): Promise<number> {
  const buffer = await fs.readFile(filePath)
  const blob = new Blob([new Uint8Array(buffer)], { type: 'image/png' })
  const form = new FormData()
  form.append('file', blob, `${slug}.png`)
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
  console.log('Logged in.')

  const imagePath = path.resolve('public/images/metal-background.png')

  for (const sample of SAMPLE_POSTS) {
    // Skip if post exists
    const existRes = await fetch(
      `${BASE}/api/posts?where[slug][equals]=${sample.slug}&limit=1`,
      { headers: { Authorization: `JWT ${token}` } },
    )
    const existData = await existRes.json()
    if (existData.docs?.length > 0) {
      console.log(`- skip "${sample.slug}"`)
      continue
    }

    const authorId = await findOrCreate(token, 'authors', 'name', sample.author.name, {
      name: sample.author.name,
      role: sample.author.role,
    })
    const categoryId = await findOrCreate(token, 'categories', 'slug', sample.category.slug, {
      name: sample.category.name,
      slug: sample.category.slug,
    })
    const mediaId = await uploadMedia(token, imagePath, sample.title, sample.slug)

    const createRes = await fetch(`${BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({
        title: sample.title,
        slug: sample.slug,
        description: sample.description,
        content: lexicalBody(sample.body),
        featuredImage: mediaId,
        author: authorId,
        category: categoryId,
        readTime: sample.readTime,
        status: 'published',
        publishedDate: new Date().toISOString(),
      }),
    })
    const createData = await createRes.json()
    if (!createData.doc?.id) {
      console.error(`! failed "${sample.slug}":`, JSON.stringify(createData))
      continue
    }
    console.log(`+ created "${sample.slug}"`)
  }

  console.log('\nSeed complete.')
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
