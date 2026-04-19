import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPostBySlug, getPublishedPosts } from '@/lib/blog/payload'
import { generateSEOMetadata } from '@/lib/blog/seo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  return generateSEOMetadata(post)
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const post = await getPostBySlug(slug, isDraft)

  if (!post) notFound()

  return (
    <div className="min-h-screen bg-[#FEFEFE] text-slate-900">
      {/* Hero con imagen del post */}
      <section className="relative w-full h-[60vh]">
        <Image
          src={post.image || '/fallback.jpeg'}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-4 pb-12">
          <div className="max-w-3xl">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm text-sm">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <span>{post.author.name}</span>
              </div>
              <span className="rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm text-sm">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold text-white">
              {post.title}
            </h1>
            <p className="mt-3 text-white/80 text-sm">
              {post.date} · {post.readTime}
            </p>
          </div>
        </div>
      </section>

      {/* Artículo */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors mb-8"
        >
          ← Back to Blog
        </Link>

        <article
          className="blog-content max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.audioUrl && (
          <div className="mt-10 p-4 border border-slate-200 rounded-xl">
            <p className="text-sm font-medium mb-2">Listen to this article</p>
            <audio controls className="w-full" src={post.audioUrl} />
          </div>
        )}
      </div>
    </div>
  )
}
