import { Rivet } from './Rivet'

interface MetalPlateProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  rivetCount?: number
}

export function MetalPlate({
  children,
  className = '',
  hoverable = false,
  rivetCount = 8,
}: MetalPlateProps) {
  const sideCount = Math.max(3, Math.floor(rivetCount / 2))

  return (
    <div
      className={`metal-plate relative overflow-hidden ${hoverable ? 'metal-plate-hover' : ''} ${className}`}
    >
      {/* Remaches: fila superior */}
      <div
        className="pointer-events-none absolute top-1.5 left-3 right-3 flex items-center justify-between"
        aria-hidden="true"
      >
        {Array.from({ length: rivetCount }).map((_, i) => (
          <Rivet key={`top-${i}`} size="sm" />
        ))}
      </div>

      {/* Remaches: fila inferior */}
      <div
        className="pointer-events-none absolute bottom-1.5 left-3 right-3 flex items-center justify-between"
        aria-hidden="true"
      >
        {Array.from({ length: rivetCount }).map((_, i) => (
          <Rivet key={`bottom-${i}`} size="sm" />
        ))}
      </div>

      {/* Remaches: columna izquierda */}
      <div
        className="pointer-events-none absolute top-5 bottom-5 left-1.5 flex flex-col items-center justify-between"
        aria-hidden="true"
      >
        {Array.from({ length: sideCount }).map((_, i) => (
          <Rivet key={`left-${i}`} size="sm" />
        ))}
      </div>

      {/* Remaches: columna derecha */}
      <div
        className="pointer-events-none absolute top-5 bottom-5 right-1.5 flex flex-col items-center justify-between"
        aria-hidden="true"
      >
        {Array.from({ length: sideCount }).map((_, i) => (
          <Rivet key={`right-${i}`} size="sm" />
        ))}
      </div>

      {/* Contenido con padding para no chocar con los remaches */}
      <div className="relative px-5 py-5">{children}</div>
    </div>
  )
}
