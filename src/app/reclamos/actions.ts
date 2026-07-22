'use server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type ClaimResult = { ok: boolean; message: string }

async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = await res.json()
    return data?.success === true
  } catch { return false }
}

export async function submitClaim(fd: FormData): Promise<ClaimResult> {
  const token = (fd.get('cf-turnstile-response') as string) || null
  if (!(await verifyTurnstile(token))) {
    return { ok: false, message: 'No pudimos verificar que eres una persona. Recarga e inténtalo de nuevo.' }
  }

  const payload = {
    tipo: String(fd.get('tipo') || 'categoria'),
    sport: (fd.get('sport') as string) || null,
    reported_name: String(fd.get('reported_name') || '').trim().slice(0, 120) || null,
    club_name: String(fd.get('club_name') || '').trim().slice(0, 120) || null,
    description: String(fd.get('description') || '').trim().slice(0, 2000),
    contact_name: String(fd.get('contact_name') || '').trim().slice(0, 120),
    contact_email: String(fd.get('contact_email') || '').trim().slice(0, 120) || null,
    contact_phone: String(fd.get('contact_phone') || '').trim().slice(0, 40) || null,
    status: 'pendiente' as const,
  }

  if (!payload.description || payload.description.length < 20) {
    return { ok: false, message: 'Cuéntanos el caso con un poco más de detalle (mínimo 20 caracteres).' }
  }
  if (!payload.contact_name) return { ok: false, message: 'Necesitamos tu nombre para dar seguimiento.' }
  if (!payload.contact_email && !payload.contact_phone) {
    return { ok: false, message: 'Déjanos un correo o teléfono para responderte.' }
  }

  let db: any
  try { db = createAdminClient() } catch { db = createClient() }
  const { error } = await db.from('claims').insert(payload as any)
  if (error) return { ok: false, message: `No se pudo enviar: ${error.message}` }
  return { ok: true, message: '¡Reclamo recibido! El comité lo revisará y te contactará. Gracias por ayudarnos a mantener la liga justa.' }
}
