import { Rivet } from './Rivet'

export function BlogHeader() {
  return (
    <div className="relative">
      {/* Fila de remaches superior */}
      <div className="flex items-center justify-between px-4 py-2" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <Rivet key={`top-${i}`} size="sm" />
        ))}
      </div>

      <div className="flex">
        {/* Remaches laterales izquierdos */}
        <div className="flex flex-col items-center justify-between py-4 px-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Rivet key={`left-${i}`} size="sm" />
          ))}
        </div>

        {/* Chapa del header */}
        <div className="metal-plate flex-1 py-10 sm:py-14 px-6 sm:px-10">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Remache grande decorativo (como en la imagen) */}
            <Rivet size="lg" />

            <div>
              <h1 className="metal-title text-4xl sm:text-5xl md:text-6xl">
                Tiempo de Aviadores
              </h1>
              <p className="metal-subtitle mt-3 text-xs sm:text-sm max-w-xl">
                Historias, tecnica y pasion por la aviacion
              </p>
            </div>
          </div>
        </div>

        {/* Remaches laterales derechos */}
        <div className="flex flex-col items-center justify-between py-4 px-2" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <Rivet key={`right-${i}`} size="sm" />
          ))}
        </div>
      </div>

      {/* Fila de remaches inferior */}
      <div className="flex items-center justify-between px-4 py-2" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <Rivet key={`bottom-${i}`} size="sm" />
        ))}
      </div>
    </div>
  )
}
