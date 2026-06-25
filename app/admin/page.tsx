import { adminLogout, getAllEntries } from '@/app/actions'
import { AdminLogin } from '@/components/admin-login'
import { AlbumBook } from '@/components/album-book'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { isAdmin } from '@/lib/session'
import { LogOut, Printer } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const admin = await isAdmin()

  if (!admin) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md album-shadow border-border">
          <CardContent className="p-6 sm:p-8">
            <p className="text-xs uppercase tracking-wider text-primary">
              Acceso restringido
            </p>
            <h1 className="mt-1 mb-2 font-serif text-2xl font-semibold text-foreground">
              Panel de administrador
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Solo el organizador puede ver el álbum consolidado.
            </p>
            <AdminLogin />
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <Link
                href="/"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Volver al inicio
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  const entries = await getAllEntries()
  const withContent = entries.filter(
    (e) => e.mensaje.trim() !== '' || (e.fotos && e.fotos.length > 0),
  )

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-primary">
            Álbum consolidado
          </p>
          <h1 className="font-serif text-2xl font-semibold text-foreground">
            {withContent.length}{' '}
            {withContent.length === 1
              ? 'mensaje recopilado'
              : 'mensajes recopilados'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/imprimir"
            target="_blank"
            className={buttonVariants({ variant: 'secondary' })}
          >
            <Printer className="size-4" />
            Generar para enviar
          </Link>
          <form action={adminLogout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut className="size-4" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      {withContent.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-10 text-center text-muted-foreground">
            Aún no hay mensajes con contenido. Comparte el enlace de inicio con
            los compañeros para que dejen su mensaje.
          </CardContent>
        </Card>
      ) : (
        <AlbumBook entries={withContent} canDelete />
      )}
    </main>
  )
}
