'use client'

import { adminLogin } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'

export function AdminLogin() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function action(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await adminLogin(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña de administrador</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? 'Verificando…' : 'Ver el álbum consolidado'}
      </Button>
    </form>
  )
}
