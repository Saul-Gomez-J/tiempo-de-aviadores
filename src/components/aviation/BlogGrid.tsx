import type { BlogPost } from '@/lib/blog/payload'
import { MetalPlate } from './MetalPlate'
import { BlogCard } from './BlogCard'
import { RivetRow } from './RivetRow'

interface BlogGridProps {
  posts: BlogPost[]
}

export function BlogGrid({ posts }: BlogGridProps) {
  if (posts.length === 0) {
    return (
      <div className="py-16">
        <MetalPlate className="p-8 text-center">
          <p className="text-[var(--text-muted-metal)] text-lg">
            No hay publicaciones todavia. Vuelve pronto.
          </p>
        </MetalPlate>
      </div>
    )
  }

  // Agrupar posts en filas de 2
  const rows: BlogPost[][] = []
  for (let i = 0; i < posts.length; i += 2) {
    rows.push(posts.slice(i, i + 2))
  }

  return (
    <div className="px-2 sm:px-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>
          {/* Fila de remaches separadora entre filas de posts */}
          {rowIndex > 0 && <RivetRow count={16} className="px-2" />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {row.map((post) => (
              <MetalPlate key={post.id} hoverable rivetCount={8}>
                <BlogCard post={post} />
              </MetalPlate>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
