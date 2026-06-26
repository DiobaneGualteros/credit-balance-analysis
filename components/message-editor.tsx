'use client'

import { removePhoto, saveMessage } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { Entry } from '@/lib/db/schema'
import {
  COLOR_DEFAULT,
  COLOR_OPTIONS,
  FONT_DEFAULT,
  FONT_OPTIONS,
  fontFamily,
} from '@/lib/estilos'
import { FRASES_JUBILACION, fraseAleatoria } from '@/lib/frases'
import {
  Feather,
  ImagePlus,
  Loader2,
  Quote,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

function fileUrl(pathname: string) {
  return `/api/file?pathname=${encodeURIComponent(pathname)}`
}

export function MessageEditor({ entry }: { entry: Entry }) {
  const [mensaje, setMensaje] = useState(entry.mensaje ?? '')
  const [color, setColor] = useState(entry.color ?? COLOR_DEFAULT)
  const [font, setFont] = useState(entry.font ?? FONT_DEFAULT)
  const [fotos, setFotos] = useState<string[]>(entry.fotos ?? [])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()
  const [frase, setFrase] = useState(FRASES_JUBILACION[0])
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Randomize the phrase only on the client to avoid SSR hydration mismatch.
  useEffect(() => {
    setFrase(fraseAleatoria())
  }, [])

  function usarFrase() {
    setMensaje((prev) => {
      const limpio = prev.trim()
      return limpio.length === 0 ? frase : `${limpio}\n\n${frase}`
    })
  }

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
    setError(null)
    startSaving(async () => {
      const fd = new FormData()
      fd.append('mensaje', mensaje)
      fd.append('fotos', JSON.stringify(fotos))
      fd.append('color', color)
      fd.append('font', font)
      const result = await saveMessage(fd)
      if (result?.error) setError(result.error)
      else router.push('/escribir/preview')
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* The blank sheet: message + photos together on the same page */}
      <div className="album-sheet rounded-2xl border border-border p-7 album-shadow sm:p-12">
        {/* Decorative header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex w-full items-center justify-center gap-3">
            <span className="h-px w-12 bg-accent/70 sm:w-20" />
            <Feather className="size-5 text-accent-foreground" />
            <span className="h-px w-12 bg-accent/70 sm:w-20" />
          </div>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-foreground">
            Mi hoja del álbum
          </h2>
          <p className="mt-1 text-sm italic text-muted-foreground">
            Un recuerdo para celebrar tu jubilación
          </p>
        </div>

        {/* Suggested phrase to help the writer */}
        <div className="mb-6 rounded-xl border-2 border-accent bg-accent/30 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <Sparkles className="size-4" />
            Frase para ayudarte
          </div>
          <p className="mt-2 flex gap-2 font-serif text-lg italic leading-relaxed text-foreground">
            <Quote className="mt-1 size-5 shrink-0 text-accent-foreground" />
            <span>{frase}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={usarFrase}>
              Usar esta frase
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setFrase((actual) => fraseAleatoria(actual))}
            >
              <RefreshCw className="size-4" />
              Ver otra
            </Button>
          </div>
        </div>

        <Label
          htmlFor="mensaje"
          className="mb-2 block font-serif text-lg text-foreground"
        >
          Escribe tu mensaje aquí
        </Label>

        {/* Style controls: text color and font */}
        <div className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Color:</span>
            <div className="flex items-center gap-1.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  aria-label={`Color ${c.label}`}
                  aria-pressed={color === c.value}
                  className={`size-7 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c.value
                      ? 'border-foreground ring-2 ring-ring/40'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Fuente:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFont(f.key)}
                  aria-pressed={font === f.key}
                  style={{ fontFamily: f.family }}
                  className={`rounded-md border px-2.5 py-1 text-sm transition-colors ${
                    font === f.key
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-foreground hover:bg-secondary'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Textarea
          id="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Querido(a)... Quiero agradecerte por todos estos años..."
          style={{ color, fontFamily: fontFamily(font) }}
          className="writing-surface min-h-72 resize-y rounded-lg border border-border p-4 text-lg leading-relaxed shadow-sm placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />

        {/* Photos on the same sheet */}
        <div className="mt-8 border-t border-border pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg text-foreground">
              Tus fotos en esta hoja
            </h3>
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
              Aún no has agregado fotos. Son opcionales, pero hacen el recuerdo
              más especial.
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
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
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
