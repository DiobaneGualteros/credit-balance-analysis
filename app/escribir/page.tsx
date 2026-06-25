import { getMyEntry, leaveParticipant } from '@/app/actions'
import { MessageEditor } from '@/components/message-editor'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function EscribirPage() {
  const entry = await getMyEntry()
  if (!entry) redirect('/')

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-8">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            Álbum de jubilación
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            Hola, {entry.nombre}
          </h1>
        </div>
        <form action={leaveParticipant}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="size-4" />
            Salir
          </Button>
        </form>
      </header>

      <p className="mb-6 text-pretty leading-relaxed text-muted-foreground">
        Esta es tu hoja en blanco. Escribe tu mensaje de despedida y agrega las
        fotos que quieras incluir. Puedes guardar y volver a editar cuando
        quieras usando tu cédula.
      </p>

      <MessageEditor entry={entry} />
    </main>
  )
}
