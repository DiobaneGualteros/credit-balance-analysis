import { getAllEntryNames, getMyEntry } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { COLOR_DEFAULT, fontFamily } from '@/lib/estilos'
import { BOOK_TITLE, INTRO_PARRAFOS, INTRO_SUBTITULO } from '@/lib/libro'
import { Feather } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function fileUrl(pathname: string) {
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

export default async function PreviewPage() {
  const entry = await getMyEntry()
  if (!entry) redirect('/')

  const allEntries = await getAllEntryNames()

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground text-pretty">
          Así se verá tu página en el álbum completo.
        </p>
        <Link
          href="/escribir"
          className={buttonVariants({ variant: 'default' })}
        >
          Volver a editar
        </Link>
      </div>

      {/* Cover */}
      <section className="print-page album-cover flex min-h-[70vh] flex-col items-center justify-center rounded-2xl p-12 text-center album-shadow">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">
            Con cariño
          </p>
          <img
            src="/portada-jubilacion.png"
            alt="Ilustración de un libro abierto con una pluma"
            className="cover-image-frame mt-6 aspect-square w-64 rounded-xl object-cover"
          />
          <h1 className="mt-6 font-serif text-5xl font-bold text-sky-950 text-balance">
            Álbum de Recuerdos
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-amber-700">
            Para
          </p>
          <p className="font-serif text-3xl font-semibold text-sky-900">
            Boris Ceballos
          </p>
          <div className="mt-6 h-px w-24 bg-amber-600/70" />
          <p className="mt-6 max-w-md italic text-sky-900/85 text-pretty">
            Mensajes y recuerdos de quienes te acompañaron en este camino.
          </p>
        </div>
      </section>

      {/* Blank page */}
      <section className="print-page album-sheet mt-8 min-h-[60vh] rounded-2xl border border-border" />

      {/* Introduction */}
      <article className="print-page album-sheet mt-8 rounded-2xl border border-border p-10 album-shadow">
        <header className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-accent/70" />
          <span className="font-serif text-sm uppercase tracking-[0.2em] text-primary">
            {BOOK_TITLE}
          </span>
          <span className="h-px w-12 bg-accent/70" />
        </header>
        <h2 className="font-serif text-3xl font-bold text-foreground text-balance">
          Introducción
        </h2>
        <p className="mt-1 font-serif text-lg italic text-primary">
          {INTRO_SUBTITULO}
        </p>
        <div className="mt-5 space-y-4">
          {INTRO_PARRAFOS.map((p, i) => (
            <p
              key={i}
              className="text-justify text-base leading-relaxed text-foreground"
            >
              {p}
            </p>
          ))}
        </div>
      </article>

      {/* Glossary */}
      <article className="print-page album-sheet mt-8 rounded-2xl border border-border p-10 album-shadow">
        <header className="mb-6 flex items-center justify-center gap-3">
          <span className="h-px w-12 bg-accent/70" />
          <span className="font-serif text-sm uppercase tracking-[0.2em] text-primary">
            {BOOK_TITLE}
          </span>
          <span className="h-px w-12 bg-accent/70" />
        </header>
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Glosario
        </h2>
        <p className="mt-1 text-base italic text-muted-foreground">
          Quienes dejaron su huella en estas páginas
        </p>
        <ul className="mt-6 space-y-3">
          {allEntries.map((e, i) => (
            <li
              key={e.id}
              className="flex items-baseline gap-3 text-base text-foreground"
            >
              <span className="font-medium">{e.nombre}</span>
              <span className="flex-1 translate-y-[-4px] border-b border-dotted border-muted-foreground/40" />
              <span className="tabular-nums text-muted-foreground">
                {i + 1}
              </span>
            </li>
          ))}
        </ul>
      </article>

      {/* Blank page */}
      <section className="print-page album-sheet mt-8 min-h-[60vh] rounded-2xl border border-border" />

      {/* Participant's entry */}
      <article className="print-page album-sheet mt-8 flex min-h-[60vh] flex-col rounded-2xl border border-border p-10 album-shadow">
        <header className="mb-6 flex flex-col items-center text-center">
          <div className="flex w-full items-center justify-center gap-3">
            <span className="h-px w-12 bg-accent/70 sm:w-20" />
            <Feather className="size-5 text-accent-foreground" />
            <span className="h-px w-12 bg-accent/70 sm:w-20" />
          </div>
          <p className="mt-3 font-serif text-sm uppercase tracking-[0.2em] text-primary">
            {BOOK_TITLE}
          </p>
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {entry.nombre}
          </h2>
        </header>

        <div className="flex-1">
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
            <div className="mt-6 grid grid-cols-2 gap-3">
              {entry.fotos.map((p) => (
                <img
                  key={p}
                  src={fileUrl(p) || '/placeholder.svg'}
                  alt={`Foto de ${entry.nombre}`}
                  className="w-full rounded-md border border-border object-cover"
                />
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Back cover */}
      <section className="print-page album-cover mt-8 flex min-h-[50vh] flex-col items-center justify-center rounded-2xl p-12 text-center album-shadow">
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="font-serif text-4xl font-bold text-sky-950">
            ¡Feliz jubilación!
          </h2>
          <div className="mt-5 h-px w-20 bg-amber-600/70" />
          <p className="mt-5 italic text-sky-900/85 text-pretty">
            Gracias por tantos años de dedicación.
          </p>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <Link
          href="/escribir"
          className={buttonVariants({ variant: 'default', size: 'lg' })}
        >
          Volver a editar mi mensaje
        </Link>
      </div>
    </main>
  )
}
