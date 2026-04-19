import { getPayload } from 'payload'
import config from '@payload-config'
import { getPayloadPopulateFn } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTMLAsync } from '@payloadcms/richtext-lexical/html-async'
import type { SerializedEditorState } from 'lexical'
import { getHighlighter, resolveLanguage } from './highlighter'

// === TIPOS ===

export interface BlogPost {
  id: number
  slug: string
  title: string
  description: string
  date: string
  image: string
  author: {
    name: string
    role: string
    avatar: string
  }
  category: string
  readTime: string
  content: string
  audioUrl?: string | null
  meta?: {
    title?: string | null
    description?: string | null
    image?: { url?: string | null } | string | number | null
  }
}

type LexicalContent = SerializedEditorState

// === QUERIES ===

export async function getPaginatedPosts(
  page: number = 1,
  limit: number = 8,
): Promise<{ posts: BlogPost[]; totalPages: number }> {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      status: { equals: 'published' },
    },
    sort: '-publishedDate',
    page,
    limit,
    depth: 2,
  })

  return {
    posts: await Promise.all(
      result.docs.map((doc) => transformPost(payload, doc)),
    ),
    totalPages: result.totalPages,
  }
}

export async function getPostBySlug(slug: string, draft: boolean = false) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      ...(draft ? {} : { status: { equals: 'published' } }),
    },
    limit: 1,
    depth: 2,
    draft,
  })

  return result.docs.length > 0
    ? await transformPost(payload, result.docs[0], draft)
    : null
}

export async function getPublishedPosts() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    depth: 2,
  })

  return Promise.all(
    result.docs.map((doc) => transformPost(payload, doc)),
  )
}

// === TRANSFORMACIÓN ===

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function transformPost(payload: any, post: any, draft = false): Promise<BlogPost> {
  const author = post.author
  const category = post.category
  const featuredImage = post.featuredImage

  const imageUrl = featuredImage?.url || '/images/fallback.png'
  const avatarUrl = author?.avatar?.url || 'https://avatar.vercel.sh/default'

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: new Date(post.publishedDate || post.updatedAt).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    image: imageUrl,
    author: {
      name: author?.name || 'Unknown',
      role: author?.role || '',
      avatar: avatarUrl,
    },
    category: category?.name || 'General',
    readTime: post.readTime,
    content: await lexicalToHTML(payload, post.content, draft),
    audioUrl: post.audio?.url || null,
    meta: post.meta,
  }
}

// === LEXICAL TO HTML ===

export async function lexicalToHTML(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  content: LexicalContent,
  draft: boolean = false,
): Promise<string> {
  if (!content?.root?.children?.length) return ''

  const [populate, highlighter] = await Promise.all([
    getPayloadPopulateFn({
      currentDepth: 0,
      depth: 2,
      draft,
      overrideAccess: true,
      payload,
      showHiddenFields: false,
    }),
    getHighlighter(),
  ])

  return convertLexicalToHTMLAsync({
    data: content,
    disableContainer: true,
    populate,
    converters: ({ defaultConverters }) => ({
      ...defaultConverters,
      blocks: {
        Code: ({ node }: { node: { fields: unknown } }) => {
          const fields = typeof node.fields === 'object' && node.fields !== null
            ? (node.fields as Record<string, unknown>)
            : {}

          const code = typeof fields.code === 'string' ? fields.code : ''
          const language = typeof fields.language === 'string' ? fields.language : 'plaintext'
          const lang = resolveLanguage(language)

          return highlighter.codeToHtml(code, { lang, theme: 'github-dark' })
        },
      },
    }),
  })
}
