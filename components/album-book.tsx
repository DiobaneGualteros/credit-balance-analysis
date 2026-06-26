'use client'

import { deleteEntry } from '@/app/actions'
import type { Entry } from '@/lib/db/schema'
import { COLOR_DEFAULT, fontFamily } from '@/lib/estilos'
import { BOOK_TITLE, INTRO_PARRAFOS, INTRO_SUBTITULO } from '@/lib/libro'
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

// Header reused on every inner leaf: shows the book title, not "Página N"
function LeafHeader() {
  return (
    <div className="mb-4 flex items-center justify-center gap-3 border-b border-amber-600/40 pb-3">
      <span className="h-px w-8 bg-amber-600/60" />
      <p className="font-serif text-sm uppercase tracking-[0.2em] text-amber-700">
        {BOOK_TITLE}
      </p>
      <span className="h-px w-8 bg-amber-600/60" />
    </div>
  )
}

// Footer reused on every inner leaf: shows the page number
function LeafFooter({ pageNumber }: { pageNumber: number }) {
  return (
    <div className="mt-3 border-t border-amber-600/30 pt-2 text-center">
      <p className="text-xs text-neutral-500">{pageNumber}</p>
    </div>
  )
}

const BlankPageContent = forwardRef<HTMLDivElement, { label?: string }>(
  function BlankPageContent({ label }, ref) {
    return (
      <div
        ref={ref}
        className="album-leaf flex h-full w-full items-center justify-center"
      >
        <p className="text-xs italic text-neutral-400">
          {label ?? ''}
        </p>
      </div>
    )
  },
)

function IntroContent() {
  return (
    <div className="flex h-full flex-col p-7 sm:p-8">
      <LeafHeader />
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-serif text-xl font-bold text-neutral-900 text-balance">
          Introducción
        </h3>
        <p className="mt-1 font-serif text-base italic text-amber-700">
          {INTRO_SUBTITULO}
        </p>
        <div className="mt-4 space-y-3">
          {INTRO_PARRAFOS.map((p, i) => (
            <p
              key={i}
              className="text-justify text-sm leading-relaxed text-neutral-900"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}

function GlossaryContent({
  entries,
  startPage,
}: {
  entries: Entry[]
  startPage: number
}) {
  return (
    <div className="flex h-full flex-col p-7 sm:p-8">
      <LeafHeader />
      <div className="flex-1 overflow-y-auto">
        <h3 className="font-serif text-xl font-bold text-neutral-900">
          Glosario
        </h3>
        <p className="mt-1 text-sm italic text-neutral-500">
          Quienes dejaron su huella en estas páginas
        </p>
        <ul className="mt-4 space-y-2">
          {entries.map((entry, i) => (
            <li
              key={entry.id}
              className="flex items-baseline gap-2 text-sm text-neutral-900"
            >
              <span className="font-medium">{entry.nombre}</span>
              <span className="flex-1 translate-y-[-3px] border-b border-dotted border-neutral-400" />
              <span className="tabular-nums text-neutral-500">
                {startPage + i}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function EntryContent({
  entry,
  pageNumber,
  canDelete,
  onDelete,
  deleting,
}: {
  entry: Entry
  pageNumber: number
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
          className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-red-300 bg-white/90 px-2.5 py-1 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
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
      <LeafHeader />
      <div className="flex-1 overflow-y-auto">
        <h3 className="mb-3 font-serif text-lg font-semibold text-neutral-900">
          {entry.nombre}
        </h3>
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
                className="aspect-square w-full rounded-md border border-neutral-200 object-cover"
              />
            ))}
          </div>
        )}
      </div>
      {/* Sender signature */}
      <div className="mt-4 border-t border-amber-600/40 pt-3 text-right">
        <p className="text-xs uppercase tracking-wider text-neutral-500">
          De parte de
        </p>
        <p className="font-serif text-lg italic text-neutral-900">
          {entry.nombre}
        </p>
      </div>
      <LeafFooter pageNumber={pageNumber} />
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
                Álbum de Recuerdos
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-amber-700">
                Para
              </p>
              <p className="font-serif text-xl font-semibold text-sky-900">
                Boris Ceballos
              </p>
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

          {/* Blank page between cover and introduction */}
          <BlankPageContent />

          {/* Introduction */}
          <Page>
            <IntroContent />
          </Page>

          {/* Glossary of participants and their page numbers */}
          <Page>
            <GlossaryContent entries={entries} startPage={1} />
          </Page>

          {/* Blank page between introduction/glossary and the entries */}
          <BlankPageContent />

          {/* Entries */}
          {entries.map((entry, i) => (
            <Page key={entry.id}>
              <EntryContent
                entry={entry}
                pageNumber={i + 1}
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
          className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
        >
          <ChevronLeft className="size-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={flipNext}
          className="flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
        >
          Siguiente
          <ChevronRight className="size-4" />
        </button>
      </div>
      <p className="text-xs text-neutral-500">
        Arrastra las esquinas de las hojas para pasar las páginas.
      </p>
    </div>
  )
}
