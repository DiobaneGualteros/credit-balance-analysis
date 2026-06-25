import { getParticipantId } from '@/lib/session'
import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const participantId = await getParticipantId()
  if (!participantId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes' },
        { status: 400 },
      )
    }

    const blob = await put(`album/${participantId}/${file.name}`, file, {
      access: 'private',
      addRandomSuffix: true,
    })

    return NextResponse.json({ pathname: blob.pathname })
  } catch (error) {
    console.error('[v0] Upload error:', error)
    return NextResponse.json({ error: 'Error al subir' }, { status: 500 })
  }
}
