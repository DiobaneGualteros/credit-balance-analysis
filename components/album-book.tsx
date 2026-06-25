'use client'

import type { Entry } from '@/lib/db/schema'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import dynamic from 'next/dynamic'
import { forwardRef, useEffect, useRef, useState } from 'react'

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
      className={`paper-page flex h-full w-full flex-col overflow-hidden border border-border ${className}`}
    >
      {children}
    </div>
  )
})

function EntryPage({ entry, index }: { entry: Entry; index: number }) {
  return (
    <div className="flex h-full flex-col p-8">
      <div className="mb-4 border-b border-border pb-3">
        <p className="text-xs uppercase tracking-wider text-primary">
          Mensaje {index + 1}
        </p>
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {entry.nombre}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">
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
    </div>
  )
}

export function AlbumBook({ entries }: { entries: Entry[] }) {
  const bookRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(
    null,
  )
  const [size, setSize] = useState({ width: 420, height: 560 })

  useEffect(() => {
    function update() {
      const w = Math.min(window.innerWidth - 48, 460)
      const width = Math.max(280, w)
      setSize({ width, height: Math.round(width * 1.33) })
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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="album-shadow rounded-lg">
        {/* @ts-expect-error react-pageflip types are loose */}
        <HTMLFlipBook
          ref={bookRef}
          width={size.width}
          height={size.height}
          size="fixed"
          minWidth={280}
          maxWidth={460}
          minHeight={400}
          maxHeight={620}
          showCover
          maxShadowOpacity={0.4}
          mobileScrollSupport
          className="page-flip-book"
        >
          {/* Cover */}
          <Page className="items-center justify-center bg-primary text-primary-foreground">
            <div className="flex h-full flex-col items-center justify-center p-10 text-center">
              <p className="text-sm uppercase tracking-widest text-accent">
                Con cariño
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold leading-tight text-primary-foreground text-balance">
                Álbum de Jubilación
              </h2>
              <div className="mt-6 h-px w-16 bg-accent" />
              <p className="mt-6 text-sm text-primary-foreground/80 text-pretty">
                Mensajes y recuerdos de quienes te acompañaron en este camino.
              </p>
            </div>
          </Page>

          {/* Entries */}
          {entries.map((entry, i) => (
            <Page key={entry.id}>
              <EntryPage entry={entry} index={i} />
            </Page>
          ))}

          {/* Back cover */}
          <Page className="items-center justify-center bg-primary text-primary-foreground">
            <div className="flex h-full flex-col items-center justify-center p-10 text-center">
              <h2 className="font-serif text-2xl font-bold text-primary-foreground">
                ¡Feliz jubilación!
              </h2>
              <p className="mt-4 text-sm text-primary-foreground/80 text-pretty">
                Gracias por tantos años de dedicación.
              </p>
            </div>
          </Page>
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
