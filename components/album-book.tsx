'use client'

import { deleteEntry } from '@/app/actions'
import type { Entry } from '@/lib/db/schema'
import { COLOR_DEFAULT, fontFamily } from '@/lib/estilos'
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { forwardRef, useEffect, useRef, useState, useTransition } from 'react'

// react-pageflip touches the DOM, so load it client-side only
const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false })

function fileUrl(pathname: string) {
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

type PageProps = {
  children: React.ReactNode
  className?: string
}

// react-pageflip requires page components to forward a ref
const Page = forwardRef<HTMLDivElement, PageProps>(function Page(
  { children, className = '' },
  ref,
) {
  return (
    <div
      ref={ref}
      className={`album-leaf flex h-full w-full flex-col overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
})

const Cover = forwardRef<HTMLDivElement, PageProps>(function Cover(
  { children, className = '' },
  ref,
) {
  return (
    <div
      ref={ref}
      data-density="hard"
      className={`album-cover flex h-full w-full flex-col overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
})

function EntryContent({
  entry,
  index,
  canDelete,
  onDelete,
  deleting,
}: {
  entry: Entry
  index: number
  canDelete?: boolean
  onDelete?: (id: number) => void
  deleting?: boolean
}) {
  return (
    <div className="relative flex h-full flex-col p-7 sm:p-8">
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete?.(entry.id)}
          disabled={deleting}
          className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-destructive/30 bg-card/90 px-2.5 py-1 text-xs font-medium text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-card disabled:opacity-50"
          aria-label={`Eliminar la página de ${entry.nombre}`}
        >
          {deleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Borrar
        </button>
      )}
      <div className="mb-4 border-b border-accent/40 pb-3">
        <p className="text-xs uppercase tracking-wider text-primary">
          Mensaje {index + 1}
        </p>
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {entry.nombre}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p
          className="whitespace-pre-wrap text-base leading-relaxed"
          style={{
            color: entry.color || COLOR_DEFAULT,
            fontFamily: fontFamily(entry.font),
          }}
        >
          {entry.mensaje || 'Sin mensaje escrito.'}
        </p>
        {entry.fotos && entry.fotos.length > 0 && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            {entry.fotos.slice(0, 4).map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p}
                src={fileUrl(p) || '/placeholder.svg'}
                alt={`Foto de ${entry.nombre}`}
                className="aspect-square w-full rounded-md border border-border object-cover"
              />
            ))}
          </div>
        )}
      </div>
      {/* Sender signature */}
      <div className="mt-4 border-t border-accent/40 pt-3 text-right">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          De parte de
        </p>
        <p className="font-serif text-lg italic text-primary">
          {entry.nombre}
        </p>
      </div>
    </div>
  )
}

export function AlbumBook({
  entries,
  canDelete = false,
}: {
  entries: Entry[]
  canDelete?: boolean
}) {
  const router = useRouter()
  const bookRef = useRef<{
    pageFlip: () => { flipNext: () => void; flipPrev: () => void }
  } | null>(null)
  const [size, setSize] = useState({ width: 400, height: 540 })
  const [portrait, setPortrait] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    function update() {
      const isMobile = window.innerWidth < 768
      const available = window.innerWidth - 56
      // Two-page spread on desktop, single page on mobile.
      const width = isMobile
        ? Math.min(440, Math.max(280, available))
        : Math.min(440, Math.max(300, Math.floor(available / 2)))
      setPortrait(isMobile)
      setSize({ width, height: Math.round(width * 1.35) })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  function flipNext() {
    bookRef.current?.pageFlip()?.flipNext()
  }
  function flipPrev() {
    bookRef.current?.pageFlip()?.flipPrev()
  }

  function handleDelete(id: number) {
    if (!window.confirm('¿Seguro que deseas eliminar esta página del álbum?')) {
      return
    }
    setDeletingId(id)
    startTransition(async () => {
      await deleteEntry(id)
      setDeletingId(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="book-mount">
        {/* @ts-expect-error react-pageflip types are loose */}
        <HTMLFlipBook
          key={portrait ? 'portrait' : 'landscape'}
          ref={bookRef}
          width={size.width}
          height={size.height}
          size="fixed"
          minWidth={280}
          maxWidth={440}
          minHeight={400}
          maxHeight={620}
          showCover
          usePortrait={portrait}
          drawShadow
          maxShadowOpacity={0.5}
          mobileScrollSupport
          className="page-flip-book"
        >
          {/* Front cover */}
          <Cover>
            <div className="flex h-full flex-col items-center justify-center px-8 py-9 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-amber-700">
                Con cariño
              </p>
              <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-sky-950 text-balance sm:text-3xl">
                Álbum de Jubilación
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-px w-8 bg-amber-600/70" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/portada-jubilacion.png"
                  alt="Ilustración de un libro abierto con una pluma"
                  className="cover-image-frame mx-auto my-1 aspect-square w-44 rounded-lg object-cover sm:w-52"
                />
                <span className="h-px w-8 bg-amber-600/70" />
              </div>
              <p className="mt-4 max-w-[16rem] text-sm italic leading-relaxed text-sky-900/80 text-pretty">
                Mensajes y recuerdos de quienes te acompañaron en este camino.
              </p>
            </div>
          </Cover>

          {/* Entries */}
          {entries.map((entry, i) => (
            <Page key={entry.id}>
              <EntryContent
                entry={entry}
                index={i}
                canDelete={canDelete}
                onDelete={handleDelete}
                deleting={isPending && deletingId === entry.id}
              />
            </Page>
          ))}

          {/* Back cover */}
          <Cover>
            <div className="flex h-full flex-col items-center justify-center p-10 text-center">
              <h2 className="font-serif text-2xl font-bold text-sky-950">
                ¡Feliz jubilación!
              </h2>
              <div className="mt-3 h-px w-12 bg-amber-600/70" />
              <p className="mt-4 text-sm italic text-sky-900/80 text-pretty">
                Gracias por tantos años de dedicación.
              </p>
            </div>
          </Cover>
        </HTMLFlipBook>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={flipPrev}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={flipNext}
          className="flex items-center gap-1 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Arrastra las esquinas de las hojas para pasar las páginas.
      </p>
    </div>
  )
}
