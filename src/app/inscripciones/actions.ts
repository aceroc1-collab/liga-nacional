'use server'
import { createClient } from '@/lib/supabase/server'
import { inscriptionAmount } from '@/lib/config'

export type InscriptionResult = { ok: boolean; message: string }

export async function submitInscription(formData: FormData): Promise<InscriptionResult> {
  const supabase = createClient()

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
    sport: formData.get('sport') as string,
    category_id: (formData.get('category_id') as string) || null,
    region_id: (formData.get('region_id') as string) || null,
    club_id: (formData.get('club_id') as string) || null,
    team_name: formData.get('team_name') as string,
    roster,
    contact_name: formData.get('contact_name') as string,
    contact_phone: formData.get('contact_phone') as string,
    contact_email: formData.get('contact_email') as string,
    notes: (formData.get('notes') as string) || null,
    amount,
    status: 'pendiente' as const,
    submitted_at: new Date().toISOString(),
  }

  if (!payload.sport || !payload.team_name || !payload.contact_name) {
    return { ok: false, message: 'Faltan campos obligatorios (deporte, equipo, contacto).' }
  }

  const { error } = await supabase.from('inscriptions').insert(payload as any)
  if (error) return { ok: false, message: `No se pudo enviar: ${error.message}` }
  return { ok: true, message: '¡Solicitud enviada! El equipo de la liga la revisará y confirmará.' }
}
