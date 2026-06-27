import { getAllEntryNames, getMyEntry } from '@/app/actions'
import { AlbumBook } from '@/components/album-book'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PreviewPage() {
  const myEntry = await getMyEntry()
  if (!myEntry) redirect('/')

  const allEntries = await getAllEntryNames()

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
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

      <AlbumBook
        entries={[myEntry]}
        glossaryEntries={allEntries}
        previewEntryId={myEntry.id}
      />
    </main>
  )
}
