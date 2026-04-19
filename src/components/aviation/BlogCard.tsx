import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/blog/payload'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block h-full"
      aria-label={`Leer: ${post.title}`}
    >
      {/* Imagen destacada */}
      <div className="relative h-40 sm:h-48 overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute top-3 left-3 rounded-sm bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-white/90">
          {post.category}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-base sm:text-lg font-semibold leading-tight text-[var(--text-on-metal)] group-hover:text-white transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted-metal)] line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Footer con autor y fecha */}
        <div className="mt-auto pt-3 flex items-center gap-2 text-xs text-[var(--text-muted-metal)]">
          <Image
            src={post.author.avatar}
            alt={post.author.name}
            width={20}
            height={20}
            className="rounded-full"
          />
          <span>{post.author.name}</span>
          <span className="opacity-50">|</span>
          <span>{post.date}</span>
          <span className="opacity-50">|</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </Link>
  )
}
