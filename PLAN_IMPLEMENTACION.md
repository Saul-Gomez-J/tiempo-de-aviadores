# Plan de Implementacion - Pagina Principal "Tiempo de Aviadores"

## Concepto de Diseno

La pagina principal del blog de aviacion replica la estetica del fuselaje de un avion. La imagen de fondo muestra **chapas metalicas remachadas** tipicas del revestimiento de aeronaves clasicas. Cada articulo del blog se presenta dentro de una de estas chapas rectangulares, creando una experiencia visual cohesiva donde el contenido vive directamente sobre la estructura metalica del avion.

### Anatomia del Diseno (basada en la imagen de referencia)

```
+============================================================+
|  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  |
|  o  +--------------------------------------------------+  o |
|  o  |                                                  |  o |
|  o  |          HEADER / TITULO DEL BLOG                |  o |
|  o  |      "Tiempo de Aviadores"  +  Logo/Icono        |  o |
|  o  |                                                  |  o |
|  o  +--------------------------------------------------+  o |
|  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  |
|-----+---------------------------+---------------------------+|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  |  | Imagen del post     | |  | Imagen del post     |  |o|
|  o  |  | Titulo              | |  | Titulo              |  |o|
|  o  |  | Fecha | Autor       | |  | Fecha | Autor       |  |o|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  |o|
|-----+---------------------------+---------------------------+|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  |  | Imagen del post     | |  | Imagen del post     |  |o|
|  o  |  | Titulo              | |  | Titulo              |  |o|
|  o  |  | Fecha | Autor       | |  | Fecha | Autor       |  |o|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  |o|
|-----+---------------------------+---------------------------+|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  |  | ...mas posts...     | |  | ...mas posts...     |  |o|
|  o  |  +---------------------+ |  +---------------------+  |o|
|  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  o  |o|
+============================================================+

Leyenda:
  o = remache (rivet)
  +---+ = borde de chapa
  |   | = area de contenido del blog post
```

---

## Stack Tecnologico Existente

| Tecnologia | Version | Uso |
|---|---|---|
| Next.js | 16.2.3 | Framework (App Router) |
| React | 19.2.4 | UI |
| Payload CMS | 3.82.0 | Backend/CMS para posts |
| Tailwind CSS | v4 | Estilos |
| TypeScript | 5.x | Tipado |
| PostgreSQL | - | Base de datos |
| Sharp | 0.34.5 | Procesamiento de imagenes |

---

## Paso 1: Preparar Assets

### 1.1 Imagen de fondo
- **Archivo fuente:** `Pagina principal de tiempo de aviadores.png`
- **Accion:** Mover/renombrar a `public/images/metal-background.png`
- **Optimizacion:** Generar version WebP para mejor rendimiento
- **Uso:** Sera la imagen de fondo de toda la pagina, con `background-repeat` para cubrir toda la altura

### 1.2 Textura de chapa individual (CSS puro)
- No necesitamos recortar chapas individuales de la imagen
- Cada "chapa" de blog se recreara con **CSS** usando:
  - Fondo semi-transparente metalico (gradiente que simule metal cepillado)
  - Bordes con efecto de relieve (inset shadow + border)
  - Remaches decorativos con pseudo-elementos o elementos circulares

---

## Paso 2: Componentes a Crear

### 2.1 `MetalPlate` - Componente de chapa metalica

**Archivo:** `src/components/MetalPlate.tsx`

**Proposito:** Wrapper reutilizable que envuelve cualquier contenido en una chapa metalica con remaches.

**Props:**
```typescript
interface MetalPlateProps {
  children: React.ReactNode
  className?: string
  rivetsTop?: boolean      // mostrar remaches arriba (default: true)
  rivetsBottom?: boolean   // mostrar remaches abajo (default: true)
  rivetsLeft?: boolean     // mostrar remaches a izquierda (default: true)
  rivetsRight?: boolean    // mostrar remaches a derecha (default: true)
}
```

**Estructura visual:**
```
  o   o   o   o   o   o   o    <- fila de remaches superior
o +---------------------------+ o
o |                           | o  <- remaches laterales
o |       CONTENIDO           | o
o |                           | o
o +---------------------------+ o
  o   o   o   o   o   o   o    <- fila de remaches inferior
```

**Estilos CSS clave:**
- Background: gradiente metalico (`linear-gradient` con tonos gris-verde como en la imagen)
- Border: `2px solid` con color metalico oscuro
- Box-shadow: `inset 0 1px 0 rgba(255,255,255,0.1)` para efecto de bisel
- Los remaches seran `<span>` circulares posicionados con flexbox a lo largo de los bordes

### 2.2 `Rivet` - Componente de remache individual

**Archivo:** `src/components/Rivet.tsx`

**Proposito:** Representar un remache metalico individual.

**Estilos CSS:**
```css
.rivet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #c0c0c0, #707070, #505050);
  box-shadow:
    0 1px 2px rgba(0,0,0,0.4),
    inset 0 1px 1px rgba(255,255,255,0.3);
}
```

### 2.3 `BlogCard` - Tarjeta de post dentro de la chapa

**Archivo:** `src/components/BlogCard.tsx`

**Proposito:** Muestra la informacion de un blog post dentro de una chapa.

**Props:**
```typescript
interface BlogCardProps {
  slug: string
  title: string
  description: string
  date: string
  image: string
  author: { name: string; avatar?: string }
  category: string
  readTime: string
}
```

**Estructura interna de cada chapa/card:**
```
+---------------------------------------+
|  [Imagen destacada del post]          |
|  (ocupa el area superior de la chapa) |
+---------------------------------------+
|  Categoria                            |
|  Titulo del Post                      |
|  Descripcion breve...                 |
|                                       |
|  Foto autor | Nombre | Fecha | Tiempo |
+---------------------------------------+
```

**Comportamiento:**
- Al hover: efecto de elevacion sutil (translateY -2px + sombra mas pronunciada) y brillo en los remaches
- Click: navega a `/blog/[slug]`
- La imagen destacada tendra un overlay gradiente oscuro en la parte inferior para legibilidad del texto

### 2.4 `RivetRow` - Fila de remaches entre secciones

**Archivo:** `src/components/RivetRow.tsx`

**Proposito:** Linea horizontal de remaches que separa filas de chapas (como se ve en la imagen entre cada fila de paneles).

**Estructura:**
```
o --- o --- o --- o --- o --- o --- o --- o
```

### 2.5 `BlogHeader` - Chapa de encabezado

**Archivo:** `src/components/BlogHeader.tsx`

**Proposito:** La chapa grande superior que contiene el titulo del blog, similar a la chapa mas grande en la parte superior de la imagen.

**Contenido:**
- Titulo: "Tiempo de Aviadores"
- Subtitulo/Descripcion del blog
- Posible icono de avion o helice
- El remache grande hemisférico que se ve en la imagen (a la izquierda) se puede recrear como elemento decorativo

---

## Paso 3: Pagina Principal (`/`)

### 3.1 Estructura de la pagina

**Archivo a modificar:** `src/app/(app)/page.tsx`

```
<main> (fondo: imagen metalica con repeat-y)
  |
  +-- <BlogHeader />                    (chapa grande superior)
  |     Titulo "Tiempo de Aviadores"
  |     Subtitulo del blog
  |
  +-- <RivetRow />                      (separador de remaches)
  |
  +-- <section> Grid de posts           (grid 2 columnas)
  |     +-- <MetalPlate>
  |     |     <BlogCard post={1} />
  |     |   </MetalPlate>
  |     +-- <MetalPlate>
  |     |     <BlogCard post={2} />
  |     |   </MetalPlate>
  |     +-- <RivetRow />                (entre cada fila)
  |     +-- <MetalPlate>
  |     |     <BlogCard post={3} />
  |     |   </MetalPlate>
  |     +-- <MetalPlate>
  |           <BlogCard post={4} />
  |         </MetalPlate>
  |     +-- ...
  |
  +-- <Paginacion />                    (dentro de chapa)
  |
</main>
```

### 3.2 Logica del Server Component

```typescript
// src/app/(app)/page.tsx
export const dynamic = 'force-dynamic'

export default async function HomePage({ searchParams }) {
  const page = Number(searchParams?.page) || 1
  const { posts, totalPages } = await getPaginatedPosts(page, 8)

  return (
    <main className="metal-background">
      <BlogHeader />
      <RivetRow />
      <BlogGrid posts={posts} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </main>
  )
}
```

### 3.3 Responsive Design

| Breakpoint | Columnas | Tamano chapas |
|---|---|---|
| Mobile (< 640px) | 1 columna | 100% ancho |
| Tablet (640-1024px) | 2 columnas | ~48% ancho |
| Desktop (> 1024px) | 2 columnas | ~48% ancho, max-width 1200px |

- En mobile, las chapas se apilan verticalmente (1 columna)
- Los remaches se reducen en tamano y cantidad
- La imagen de fondo se adapta con `background-size: cover` en mobile

---

## Paso 4: Estilos CSS

### 4.1 Variables de tema metalico

**Archivo:** `src/app/globals.css` (agregar al tema existente)

```css
:root {
  /* Paleta metalica de aviacion */
  --metal-light: #9ca3a0;
  --metal-mid: #7a8280;
  --metal-dark: #5a6260;
  --metal-darker: #3d4543;
  --metal-border: #4a5250;
  --rivet-highlight: #c0c8c5;
  --rivet-shadow: #505855;
  --plate-bg: linear-gradient(
    145deg,
    rgba(120, 130, 128, 0.85),
    rgba(90, 98, 96, 0.9),
    rgba(100, 108, 106, 0.85)
  );
  --text-on-metal: #e8ece9;
  --text-muted-metal: #b8bfbc;
}
```

### 4.2 Clases utilitarias principales

```css
/* Fondo metalico de pagina */
.metal-background {
  background-image: url('/images/metal-background.png');
  background-repeat: repeat-y;
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

/* Chapa metalica */
.metal-plate {
  background: var(--plate-bg);
  border: 2px solid var(--metal-border);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

/* Remache */
.rivet {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #c0c8c5, #6a7270, #505855);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    inset 0 1px 1px rgba(255, 255, 255, 0.25);
  flex-shrink: 0;
}
```

---

## Paso 5: Estructura de Archivos Final

```
src/
  components/
    aviation/
      MetalPlate.tsx        # Chapa metalica reutilizable
      Rivet.tsx             # Remache individual
      RivetRow.tsx          # Fila horizontal de remaches
      BlogCard.tsx          # Card de post dentro de chapa
      BlogHeader.tsx        # Header con titulo del blog
      BlogGrid.tsx          # Grid de posts con chapas y remaches
      Pagination.tsx        # Paginacion estilizada como metal
  app/
    (app)/
      page.tsx              # Pagina principal (modificar existente)
      layout.tsx            # Layout (modificar metadata)
    globals.css             # Agregar variables metalicas
  lib/
    blog/
      payload.ts            # Ya existe - queries de posts
```

---

## Paso 6: Orden de Implementacion

### Fase 1 - Assets y Base (Estimado: 1 sesion)
1. Copiar imagen de fondo a `public/images/metal-background.png`
2. Agregar variables CSS metalicas a `globals.css`
3. Crear componente `Rivet.tsx`
4. Crear componente `RivetRow.tsx`

### Fase 2 - Componentes Core (Estimado: 1 sesion)
5. Crear componente `MetalPlate.tsx` con remaches
6. Crear componente `BlogCard.tsx` con diseno interior
7. Crear componente `BlogHeader.tsx`

### Fase 3 - Ensamblaje de Pagina (Estimado: 1 sesion)
8. Crear componente `BlogGrid.tsx` (grid + separadores)
9. Crear componente `Pagination.tsx` estilizado
10. Modificar `page.tsx` de la pagina principal para integrar todo

### Fase 4 - Pulido Visual (Estimado: 1 sesion)
11. Ajustar responsive design (mobile/tablet/desktop)
12. Agregar animaciones de hover en chapas
13. Optimizar imagen de fondo (WebP, lazy loading)
14. Actualizar metadata SEO para la pagina principal

---

## Paso 7: Detalles de Interaccion y UX

### Hover en chapas de blog
- La chapa se eleva ligeramente (`transform: translateY(-3px)`)
- Los remaches brillan sutilmente (cambio de opacidad en highlight)
- Sombra mas pronunciada para efecto de profundidad
- Transicion suave de 300ms

### Scroll
- La imagen de fondo permanece fija (`background-attachment: fixed`) en desktop para efecto parallax sutil
- En mobile, el fondo hace scroll normalmente (mejor rendimiento)

### Carga de imagenes
- Las imagenes de los posts usan `next/image` con lazy loading
- Placeholder blur mientras carga
- Aspect ratio fijo para evitar layout shift

### Paginacion
- Botones "Anterior" y "Siguiente" estilizados como placas metalicas pequenas
- Numero de pagina actual resaltado
- Si no hay mas paginas, el boton aparece deshabilitado (opaco)

---

## Notas Adicionales

- **Accesibilidad:** Asegurar contraste suficiente del texto sobre el fondo metalico. Usar `aria-label` en los links de las cards.
- **Performance:** La imagen de fondo es pesada; considerar usar una version comprimida y/o CSS gradients como fallback.
- **SEO:** La pagina principal ahora sera el listado de blogs (no la pagina default de Next.js), lo cual mejora la indexacion.
- **Contenido de Payload:** Se reutilizan las funciones existentes en `src/lib/blog/payload.ts` sin modificaciones.
