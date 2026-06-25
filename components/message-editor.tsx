'use client'

import { removePhoto, saveMessage } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Entry } from '@/lib/db/schema'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState, useTransition } from 'react'

function fileUrl(pathname: string) {
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

export function MessageEditor({ entry }: { entry: Entry }) {
  const [mensaje, setMensaje] = useState(entry.mensaje ?? '')
  const [fotos, setFotos] = useState<string[]>(entry.fotos ?? [])
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)
    try {
      const newPaths: string[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Error al subir una imagen')
          continue
        }
        newPaths.push(data.pathname)
      }
      setFotos((prev) => [...prev, ...newPaths])
    } catch {
      setError('No se pudo subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleRemove(pathname: string) {
    setFotos((prev) => prev.filter((p) => p !== pathname))
    await removePhoto(pathname)
  }

  function handleSave() {
    setStatus(null)
    setError(null)
    startSaving(async () => {
      const fd = new FormData()
      fd.append('mensaje', mensaje)
      fd.append('fotos', JSON.stringify(fotos))
      const result = await saveMessage(fd)
      if (result?.error) setError(result.error)
      else setStatus('Tu mensaje se guardó correctamente.')
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The blank sheet */}
      <div className="paper-page rounded-2xl border border-border p-6 album-shadow sm:p-10">
        <Label
          htmlFor="mensaje"
          className="mb-3 block font-serif text-lg text-foreground"
        >
          Escribe tu mensaje
        </Label>
        <Textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Querido(a)... Quiero agradecerte por todos estos años..."
          className="min-h-64 resize-y border-none bg-transparent font-serif text-lg leading-relaxed shadow-none focus-visible:ring-0"
        />
      </div>

      {/* Photos */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg text-foreground">Tus fotos</h3>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            {uploading ? 'Subiendo…' : 'Agregar fotos'}
          </Button>
        </div>

        {fotos.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aún no has agregado fotos. Son opcionales, pero hacen el recuerdo más
            especial.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {fotos.map((pathname) => (
              <div
                key={pathname}
                className="group relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={fileUrl(pathname) || '/placeholder.svg'}
                  alt="Foto que agregaste"
                  fill
                  className="object-cover"
                  sizes="200px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => handleRemove(pathname)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1.5 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                  aria-label="Eliminar foto"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="text-sm text-primary" role="status">
          {status}
        </p>
      )}

      <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end">
        <Button onClick={handleSave} size="lg" disabled={isSaving}>
          {isSaving ? 'Guardando…' : 'Guardar mi mensaje'}
        </Button>
      </div>
    </div>
  )
}
