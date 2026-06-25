import { cookies } from 'next/headers'

const PARTICIPANT_COOKIE = 'album_participant'
const ADMIN_COOKIE = 'album_admin'

export async function setParticipant(entryId: number) {
  const store = await cookies()
  store.set(PARTICIPANT_COOKIE, String(entryId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export async function getParticipantId(): Promise<number | null> {
  const store = await cookies()
  const value = store.get(PARTICIPANT_COOKIE)?.value
  if (!value) return null
  const id = Number(value)
  return Number.isFinite(id) ? id : null
}

export async function clearParticipant() {
  const store = await cookies()
  store.delete(PARTICIPANT_COOKIE)
}

export async function setAdmin() {
  const store = await cookies()
  store.set(ADMIN_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 12,
    path: '/',
  })
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return store.get(ADMIN_COOKIE)?.value === '1'
}

export async function clearAdmin() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getParticipantId()) !== null || (await isAdmin())
}
