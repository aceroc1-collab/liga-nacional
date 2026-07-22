'use server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { inscriptionAmount } from '@/lib/config'

export type InscriptionResult = { ok: boolean; message: string }

/**
 * Verifica el token de Cloudflare Turnstile.
 * Si aún no configuraste TURNSTILE_SECRET_KEY, no bloquea (permite operar sin captcha).
 */
async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // captcha no configurado todavía
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

export async function submitInscription(formData: FormData): Promise<InscriptionResult> {
  // 1) Anti-robot
  const captchaToken = (formData.get('cf-turnstile-response') as string) || null
  if (!(await verifyTurnstile(captchaToken))) {
    return { ok: false, message: 'No pudimos verificar que eres una persona. Recarga la página e inténtalo de nuevo.' }
  }

  const roster: any[] = []
  const names = formData.getAll('player_name') as string[]
  const padel = formData.getAll('player_padel') as string[]
  const playa = formData.getAll('player_playa') as string[]
  names.forEach((n, i) => {
    if (n?.trim()) roster.push({
      nombre: n.trim(),
      plays_padel: padel[i] === 'on' || padel[i] === '1',
      plays_playa: playa[i] === 'on' || playa[i] === '1',
    })
  })

  const sportVal = (formData.get('sport') as string) === 'playa' ? 'playa' : 'padel'
  const dual = formData.get('dual') === '1' || formData.get('dual') === 'on'
  const amount = inscriptionAmount(sportVal, dual)

  const payload = {
    season_id: (formData.get('season_id') as string) || null,
    sport: sportVal,
    category_id: (formData.get('category_id') as string) || null,
    region_id: (formData.get('region_id') as string) || null,
    club_id: (formData.get('club_id') as string) || null,
    team_name: String(formData.get('team_name') || '').trim().slice(0, 120),
    roster,
    contact_name: String(formData.get('contact_name') || '').trim().slice(0, 120),
    contact_phone: String(formData.get('contact_phone') || '').trim().slice(0, 40),
    contact_email: String(formData.get('contact_email') || '').trim().slice(0, 120),
    notes: (formData.get('notes') as string || '').slice(0, 1000) || null,
    amount,
    status: 'pendiente' as const,
    submitted_at: new Date().toISOString(),
  }

  if (!payload.sport || !payload.team_name || !payload.contact_name) {
    return { ok: false, message: 'Faltan campos obligatorios (deporte, equipo, contacto).' }
  }
  if (roster.length === 0) {
    return { ok: false, message: 'Agrega al menos un jugador a la plantilla.' }
  }

  // 2) Inserta con rol de servicio: el público ya NO escribe directo en la base,
  //    así el captcha no se puede saltar llamando a la API por fuera del formulario.
  let db: any
  try { db = createAdminClient() } catch { db = createClient() }

  const { error } = await db.from('inscriptions').insert(payload as any)
  if (error) return { ok: false, message: `No se pudo enviar: ${error.message}` }
  return { ok: true, message: '¡Solicitud enviada! El equipo de la liga la revisará y confirmará.' }
}
