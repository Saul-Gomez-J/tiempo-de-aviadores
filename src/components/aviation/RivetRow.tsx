import { Rivet } from './Rivet'

interface RivetRowProps {
  count?: number
  className?: string
}

export function RivetRow({ count = 20, className = '' }: RivetRowProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Rivet key={i} size="sm" />
      ))}
    </div>
  )
}
