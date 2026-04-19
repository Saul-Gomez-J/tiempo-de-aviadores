import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

interface Post {
  id: number | string
  slug: string
  status: string
  [key: string]: unknown
}

export const revalidatePostSitemap: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  const wasPublished = previousDoc?.status === 'published'
  const isPublished = doc.status === 'published'
  const slugChanged = previousDoc?.slug !== doc.slug

  if (!wasPublished && isPublished) {
    payload.logger.info(`[Sitemap] New post published: ${doc.slug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/blog', 'page')
  }

  if (wasPublished && !isPublished) {
    payload.logger.info(`[Sitemap] Post unpublished: ${doc.slug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/blog', 'page')
  }

  if (isPublished && slugChanged) {
    payload.logger.info(`[Sitemap] Slug changed: ${previousDoc?.slug} → ${doc.slug}`)
    revalidatePath('/sitemap.xml')
    if (previousDoc?.slug) {
      revalidatePath(`/blog/${previousDoc.slug}`, 'page')
    }
    revalidatePath(`/blog/${doc.slug}`, 'page')
  }

  if (wasPublished && isPublished) {
    payload.logger.info(`[Sitemap] Post updated: ${doc.slug}`)
    revalidatePath(`/blog/${doc.slug}`, 'page')
  }

  return doc
}

export const revalidatePostDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  if (doc?.status === 'published') {
    payload.logger.info(`[Sitemap] Post deleted: ${doc.slug}`)
    revalidatePath('/sitemap.xml')
    revalidatePath('/blog', 'page')
  }

  return doc
}
