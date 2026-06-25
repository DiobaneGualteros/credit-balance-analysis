import { EntryForm } from '@/components/entry-form'
import { Card, CardContent } from '@/components/ui/card'
import { getParticipantId } from '@/lib/session'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const participantId = await getParticipantId()
  if (participantId) redirect('/escribir')

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
        {/* Visual side */}
        <div className="order-1 flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="rounded-full border border-border bg-card px-4 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            Álbum de despedida
          </span>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-balance text-foreground sm:text-5xl">
            Una felicitación para celebrar su jubilación
          </h1>
          <p className="mt-4 max-w-md text-pretty leading-relaxed text-muted-foreground">
            Deja un mensaje desde el corazón y comparte tus fotos favoritas.
            Todos los aportes se unirán en un hermoso álbum virtual que le
            entregaremos como regalo de despedida.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border album-shadow">
            <Image
              src="/portada-jubilacion.png"
              alt="Ilustración decorativa de un álbum de jubilación"
              width={520}
              height={340}
              className="h-auto w-full max-w-md object-cover"
              priority
            />
          </div>
        </div>

        {/* Form side */}
        <div className="order-2">
          <Card className="album-shadow border-border">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                Ingresa para participar
              </h2>
              <p className="mt-1 mb-6 text-sm text-muted-foreground">
                Identifícate con tu cédula para abrir tu hoja en blanco.
              </p>
              <EntryForm />
            </CardContent>
          </Card>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            ¿Eres el organizador?{' '}
            <Link
              href="/admin"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Entrar al panel de administrador
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
