import 'dotenv/config'
import path from 'path'
import fs from 'fs/promises'
import matter from 'gray-matter'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import { markdownToLexical } from '../src/lib/blog/markdown-to-lexical'

async function main() {
  const filePath = process.argv[2]
  const isDraft = process.argv.includes('--draft')

  if (!filePath) {
    console.error('Usage: npx tsx scripts/import-post.ts <path-to-markdown> [--draft]')
    process.exit(1)
  }

  const absolutePath = path.resolve(filePath)
  const fileDir = path.dirname(absolutePath)
  const raw = await fs.readFile(absolutePath, 'utf-8')
  const { data: frontmatter, content: markdownBody } = matter(raw)

  // Validate required fields
  const required = ['title', 'slug', 'description', 'author', 'category', 'featuredImage']
  for (const field of required) {
    if (!frontmatter[field]) {
      console.error(`Missing required frontmatter field: ${field}`)
      process.exit(1)
    }
  }

  const payload = await getPayload({ config })

  // Check if post already exists
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: frontmatter.slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    console.error(`Post with slug "${frontmatter.slug}" already exists (ID: ${existing.docs[0].id})`)
    process.exit(1)
  }

  // Upload featured image
  console.log('Uploading featured image...')
  const featuredImagePath = path.resolve(fileDir, frontmatter.featuredImage)
  const featuredImageBuffer = await fs.readFile(featuredImagePath)
  const featuredImageName = path.basename(featuredImagePath)

  const featuredMedia = await payload.create({
    collection: 'media',
    data: {
      alt: frontmatter.title,
    },
    file: {
      data: featuredImageBuffer,
      name: featuredImageName,
      mimetype: getMimeType(featuredImageName),
      size: featuredImageBuffer.byteLength,
    },
  })
  console.log(`  Featured image uploaded: ID ${featuredMedia.id}`)

  // Find or create author
  console.log('Finding/creating author...')
  let authorResult = await payload.find({
    collection: 'authors',
    where: { name: { equals: frontmatter.author } },
    limit: 1,
  })
  let authorId: number
  if (authorResult.docs.length > 0) {
    authorId = authorResult.docs[0].id
    console.log(`  Author found: ID ${authorId}`)
  } else {
    const newAuthor = await payload.create({
      collection: 'authors',
      data: {
        name: frontmatter.author,
        role: frontmatter.authorRole || 'Author',
      },
    })
    authorId = newAuthor.id
    console.log(`  Author created: ID ${authorId}`)
  }

  // Find or create category
  console.log('Finding/creating category...')
  let categoryResult = await payload.find({
    collection: 'categories',
    where: { slug: { equals: frontmatter.category } },
    limit: 1,
  })
  let categoryId: number
  if (categoryResult.docs.length > 0) {
    categoryId = categoryResult.docs[0].id
    console.log(`  Category found: ID ${categoryId}`)
  } else {
    const newCategory = await payload.create({
      collection: 'categories',
      data: {
        name: frontmatter.category.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        slug: frontmatter.category,
      },
    })
    categoryId = newCategory.id
    console.log(`  Category created: ID ${categoryId}`)
  }

  // Process inline images from markdown
  console.log('Processing inline images...')
  const imageMap: Record<string, number> = {}
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match

  while ((match = imageRegex.exec(markdownBody)) !== null) {
    const [, alt, src] = match
    if (src.startsWith('http')) continue // Skip external images

    const imgPath = path.resolve(fileDir, src)
    try {
      const imgBuffer = await fs.readFile(imgPath)
      const imgName = path.basename(imgPath)

      const media = await payload.create({
        collection: 'media',
        data: { alt: alt || imgName },
        file: {
          data: imgBuffer,
          name: imgName,
          mimetype: getMimeType(imgName),
          size: imgBuffer.byteLength,
        },
      })
      imageMap[src] = media.id
      console.log(`  Inline image uploaded: ${src} → ID ${media.id}`)
    } catch (err) {
      console.warn(`  Warning: Could not load image ${src}:`, err)
    }
  }

  // Convert markdown to Lexical
  console.log('Converting markdown to Lexical...')
  const lexicalContent = markdownToLexical(markdownBody, imageMap)

  // Calculate read time
  const wordCount = markdownBody.split(/\s+/).length
  const readTime = frontmatter.readTime || `${Math.max(1, Math.ceil(wordCount / 200))} min`

  // Determine status
  const status = isDraft ? 'draft' : (frontmatter.status || 'draft')

  // Create the post
  console.log('Creating post...')
  const post = await payload.create({
    collection: 'posts',
    data: {
      title: frontmatter.title,
      slug: frontmatter.slug,
      description: frontmatter.description,
      content: lexicalContent,
      featuredImage: featuredMedia.id,
      author: authorId,
      category: categoryId,
      readTime,
      status,
      publishedDate: frontmatter.publishedDate || (status === 'published' ? new Date().toISOString() : undefined),
      ...(frontmatter.metaTitle || frontmatter.metaDescription ? {
        meta: {
          title: frontmatter.metaTitle || undefined,
          description: frontmatter.metaDescription || undefined,
        },
      } : {}),
    },
    context: { disableRevalidate: true },
  })

  console.log(`\nPost created successfully!`)
  console.log(`  ID: ${post.id}`)
  console.log(`  Slug: ${post.slug}`)
  console.log(`  Status: ${status}`)
  console.log(`  URL: /blog/${post.slug}`)

  process.exit(0)
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
