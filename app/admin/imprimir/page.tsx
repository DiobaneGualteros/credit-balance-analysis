import { getAllEntries } from '@/app/actions'
import { PrintButton } from '@/components/print-button'
import { COLOR_DEFAULT, fontFamily } from '@/lib/estilos'
import { isAdmin } from '@/lib/session'
import { Feather } from 'lucide-react'
import { redirect } from 'next/navigation'

function fileUrl(pathname: string) {
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

export default async function ImprimirPage() {
  const admin = await isAdmin()
  if (!admin) redirect('/admin')

  const entries = await getAllEntries()
  const withContent = entries.filter(
    (e) => e.mensaje.trim() !== '' || (e.fotos && e.fotos.length > 0),
  )

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="no-print mb-8 flex items-center justify-between rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground text-pretty">
          Usa el botón para imprimir o guardar como PDF y enviárselo a tu jefe.
        </p>
        <PrintButton />
      </div>

      {/* Cover — hard cover with gold frame, like the book */}
      <section className="print-page album-cover flex min-h-[70vh] flex-col items-center justify-center rounded-2xl p-12 text-center album-shadow">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-700">
            Con cariño
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/portada-jubilacion.png"
            alt="Ilustración de un libro abierto con una pluma"
            className="cover-image-frame mt-6 aspect-square w-64 rounded-xl object-cover"
          />
          <h1 className="mt-6 font-serif text-5xl font-bold text-sky-950 text-balance">
            Álbum de Jubilación
          </h1>
          <div className="mt-6 h-px w-24 bg-amber-600/70" />
          <p className="mt-6 max-w-md italic text-sky-900/85 text-pretty">
            Mensajes y recuerdos de quienes te acompañaron en este camino.
          </p>
        </div>
      </section>

      {/* Entries — framed paper leaves */}
      {withContent.map((entry, i) => (
        <article
          key={entry.id}
          className="print-page album-sheet mt-8 rounded-2xl border border-border p-10 album-shadow"
        >
          {/* Decorative header */}
          <header className="mb-6 flex flex-col items-center text-center">
            <div className="flex w-full items-center justify-center gap-3">
              <span className="h-px w-12 bg-accent/70 sm:w-20" />
              <Feather className="size-5 text-accent-foreground" />
              <span className="h-px w-12 bg-accent/70 sm:w-20" />
            </div>
            <p className="mt-3 text-xs uppercase tracking-wider text-primary">
              Página {i + 1}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {entry.nombre}
            </h2>
          </header>

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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p}
                  src={fileUrl(p) || '/placeholder.svg'}
                  alt={`Foto de ${entry.nombre}`}
                  className="w-full rounded-md border border-border object-cover"
                />
              ))}
            </div>
          )}

          {/* Sender signature */}
          <footer className="mt-8 border-t border-accent/40 pt-4 text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              De parte de
            </p>
            <p className="font-serif text-xl italic text-primary">
              {entry.nombre}
            </p>
          </footer>
        </article>
      ))}

      {/* Back cover — hard cover with gold frame */}
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
    </main>
  )
}
