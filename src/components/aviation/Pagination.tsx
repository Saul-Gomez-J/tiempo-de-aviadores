import Link from 'next/link'
import { Rivet } from './Rivet'

interface PaginationProps {
  currentPage: number
  totalPages: number
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-4 py-8 px-4" aria-label="Paginacion">
      {/* Boton anterior */}
      {currentPage > 1 ? (
        <Link
          href={`/?page=${currentPage - 1}`}
          className="metal-plate metal-plate-hover flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--text-on-metal)]"
        >
          <Rivet size="sm" />
          <span>Anterior</span>
        </Link>
      ) : (
        <span className="metal-plate flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--text-muted-metal)] opacity-50 cursor-not-allowed">
          <Rivet size="sm" />
          <span>Anterior</span>
        </span>
      )}

      {/* Indicador de pagina */}
      <span className="text-sm font-medium text-[var(--text-on-metal)] drop-shadow-md">
        {currentPage} / {totalPages}
      </span>

      {/* Boton siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={`/?page=${currentPage + 1}`}
          className="metal-plate metal-plate-hover flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--text-on-metal)]"
        >
          <span>Siguiente</span>
          <Rivet size="sm" />
        </Link>
      ) : (
        <span className="metal-plate flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[var(--text-muted-metal)] opacity-50 cursor-not-allowed">
          <span>Siguiente</span>
          <Rivet size="sm" />
        </span>
      )}
    </nav>
  )
}
