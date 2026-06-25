'use client'

import { enterAlbum } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'

export function EntryForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await enterAlbum(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cedula">Número de cédula</Label>
        <Input
          id="cedula"
          name="cedula"
          inputMode="numeric"
          placeholder="Ej: 12345678"
          autoComplete="off"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Tu nombre completo</Label>
        <Input
          id="nombre"
          name="nombre"
          placeholder="Ej: María Pérez"
          autoComplete="name"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="mt-2">
        {isPending ? 'Ingresando…' : 'Ingresar y escribir mi mensaje'}
      </Button>
      <p className="text-center text-xs text-muted-foreground text-pretty">
        Con tu cédula podrás volver más tarde para seguir editando tu mensaje.
      </p>
    </form>
  )
}
