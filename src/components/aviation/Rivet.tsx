interface RivetProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Rivet({ size = 'md', className = '' }: RivetProps) {
  if (size === 'lg') {
    return <span className={`rivet-large ${className}`} aria-hidden="true" />
  }

  const sizeClass = size === 'sm' ? 'w-[7px] h-[7px]' : ''

  return (
    <span
      className={`rivet ${sizeClass} ${className}`}
      aria-hidden="true"
    />
  )
}
