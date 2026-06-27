'use server'

import { db } from '@/lib/db'
import { entries, type Entry } from '@/lib/db/schema'
import {
  clearAdmin,
  clearParticipant,
  getParticipantId,
  isAdmin,
  setAdmin,
  setParticipant,
} from '@/lib/session'
import { del } from '@vercel/blob'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- Participant entry ---

export async function enterAlbum(formData: FormData) {
  const cedula = String(formData.get('cedula') ?? '').trim()
  const nombre = String(formData.get('nombre') ?? '').trim()

  if (!cedula || !nombre) {
    return { error: 'Por favor ingresa tu cédula y tu nombre.' }
  }
  if (!/^[0-9.\-]{4,20}$/.test(cedula)) {
    return { error: 'La cédula solo puede contener números, puntos o guiones.' }
  }

  const existing = await db
    .select()
    .from(entries)
    .where(eq(entries.cedula, cedula))
    .limit(1)

  let entryId: number
  if (existing.length > 0) {
    entryId = existing[0].id
    // Update name in case it changed
    await db
      .update(entries)
      .set({ nombre, updatedAt: new Date() })
      .where(eq(entries.id, entryId))
  } else {
    const inserted = await db
      .insert(entries)
      .values({ cedula, nombre })
      .returning({ id: entries.id })
    entryId = inserted[0].id
  }

  await setParticipant(entryId)
  redirect('/escribir')
}

export async function getMyEntry(): Promise<Entry | null> {
  const id = await getParticipantId()
  if (!id) return null
  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1)
  return rows[0] ?? null
}

export async function saveMessage(formData: FormData) {
  const id = await getParticipantId()
  if (!id) return { error: 'Tu sesión expiró. Vuelve a ingresar.' }

  const mensaje = String(formData.get('mensaje') ?? '').trim()
  const color = String(formData.get('color') ?? '#1f2937').trim()
  const font = String(formData.get('font') ?? 'serif').trim()
  const fotosRaw = String(formData.get('fotos') ?? '[]')
  let fotos: string[] = []
  try {
    const parsed = JSON.parse(fotosRaw)
    if (Array.isArray(parsed)) fotos = parsed.filter((f) => typeof f === 'string')
  } catch {
    fotos = []
  }

  await db
    .update(entries)
    .set({ mensaje, fotos, color, font, updatedAt: new Date() })
    .where(eq(entries.id, id))

  revalidatePath('/escribir')
  revalidatePath('/escribir/preview')
  return { success: true }
}

export async function removePhoto(pathname: string) {
  const id = await getParticipantId()
  if (!id) return { error: 'No autorizado.' }

  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1)
  const entry = rows[0]
  if (!entry) return { error: 'No se encontró tu hoja.' }

  const fotos = (entry.fotos ?? []).filter((f) => f !== pathname)
  await db
    .update(entries)
    .set({ fotos, updatedAt: new Date() })
    .where(eq(entries.id, id))

  try {
    await del(pathname)
  } catch {
    // ignore blob deletion errors
  }

  revalidatePath('/escribir')
  return { success: true }
}

export async function leaveParticipant() {
  await clearParticipant()
  redirect('/')
}

export async function getAllEntryNames(): Promise<{ id: number; nombre: string }[]> {
  return db.select({ id: entries.id, nombre: entries.nombre }).from(entries).orderBy(desc(entries.createdAt))
}

// --- Admin ---

export async function adminLogin(formData: FormData) {
  const password = String(formData.get('password') ?? '')
  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'El administrador no ha configurado una contraseña.' }
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Contraseña incorrecta.' }
  }
  await setAdmin()
  redirect('/admin')
}

export async function adminLogout() {
  await clearAdmin()
  redirect('/admin')
}

export async function getAllEntries(): Promise<Entry[]> {
  if (!(await isAdmin())) return []
  return db.select().from(entries).orderBy(desc(entries.createdAt))
}

export async function deleteEntry(id: number) {
  if (!(await isAdmin())) return { error: 'No autorizado.' }

  const rows = await db.select().from(entries).where(eq(entries.id, id)).limit(1)
  const entry = rows[0]
  if (!entry) return { error: 'No se encontró la página.' }

  // Remove the participant's photos from blob storage
  for (const pathname of entry.fotos ?? []) {
    try {
      await del(pathname)
    } catch {
      // ignore blob deletion errors
    }
  }

  await db.delete(entries).where(eq(entries.id, id))

  revalidatePath('/admin')
  revalidatePath('/admin/imprimir')
  return { success: true }
}
