import { getAllEntries } from '@/app/actions'
import { PrintButton } from '@/components/print-button'
import { isAdmin } from '@/lib/session'
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

      {/* Cover */}
      <section className="print-page flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-border bg-primary p-12 text-center text-primary-foreground">
        <p className="text-sm uppercase tracking-widest text-accent">
          Con cariño
        </p>
        <h1 className="mt-4 font-serif text-4xl font-bold text-primary-foreground text-balance">
          Álbum de Jubilación
        </h1>
        <div className="mt-6 h-px w-20 bg-accent" />
        <p className="mt-6 max-w-md text-primary-foreground/80 text-pretty">
          Mensajes y recuerdos de quienes te acompañaron en este camino.
        </p>
      </section>

      {/* Entries */}
      {withContent.map((entry, i) => (
        <article
          key={entry.id}
          className="print-page mt-8 rounded-2xl border border-border bg-card p-8"
        >
          <header className="mb-4 border-b border-border pb-3">
            <p className="text-xs uppercase tracking-wider text-primary">
              Mensaje {i + 1}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              {entry.nombre}
            </h2>
          </header>
          <p className="whitespace-pre-wrap font-serif text-base leading-relaxed text-foreground">
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
        </article>
      ))}

      {/* Back cover */}
      <section className="print-page mt-8 flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-border bg-primary p-12 text-center text-primary-foreground">
        <h2 className="font-serif text-3xl font-bold text-primary-foreground">
          ¡Feliz jubilación!
        </h2>
        <p className="mt-4 text-primary-foreground/80 text-pretty">
          Gracias por tantos años de dedicación.
        </p>
      </section>
    </main>
  )
}
