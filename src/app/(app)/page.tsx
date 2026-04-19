import { getPaginatedPosts } from '@/lib/blog/payload'
import { BlogHeader } from '@/components/aviation/BlogHeader'
import { BlogGrid } from '@/components/aviation/BlogGrid'
import { Pagination } from '@/components/aviation/Pagination'
import { RivetRow } from '@/components/aviation/RivetRow'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams
  const currentPage = parseInt(pageParam || '1', 10)
  const { posts, totalPages } = await getPaginatedPosts(currentPage, 8)

  return (
    <main className="metal-background">
      <div className="max-w-5xl mx-auto py-4 sm:py-8">
        <BlogHeader />
        <RivetRow count={20} className="px-2" />
        <BlogGrid posts={posts} />
        <RivetRow count={20} className="px-2" />
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </main>
  )
}
