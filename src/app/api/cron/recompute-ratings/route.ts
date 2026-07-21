import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { runRecompute } from '@/lib/ranking/recompute'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Vercel Cron envía automáticamente el header Authorization: Bearer $CRON_SECRET
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, message: 'No autorizado' }, { status: 401 })
  }
  const s = createAdminClient()
  const r = await runRecompute(s)
  return NextResponse.json(r, { status: r.ok ? 200 : 500 })
}
