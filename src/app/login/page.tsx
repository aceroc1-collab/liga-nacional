'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BRAND } from '@/lib/config'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMsg(null)
    const supabase = createClient()
    const fn = mode === 'login'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password })
    const { error } = await fn
    setLoading(false)
    if (error) setMsg(error.message)
    else if (mode === 'signup') setMsg('Revisa tu correo para confirmar la cuenta.')
    else window.location.href = '/admin'
  }

  return (
    <div className="container-app grid min-h-[70vh] place-items-center py-10">
      <div className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-noche font-black text-white">{BRAND.shortName.slice(0,2)}</div>
          <h1 className="mt-3 text-xl font-black text-noche">{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</h1>
          <p className="text-sm text-slate-500">{BRAND.name}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div><label className="label">Contraseña</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} /></div>
          {msg && <p className="rounded-lg bg-slate-100 p-2 text-sm text-slate-600">{msg}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? '…' : mode === 'login' ? 'Entrar' : 'Registrarme'}</button>
        </form>
        <button onClick={()=>setMode(mode==='login'?'signup':'login')} className="mt-4 w-full text-center text-sm text-slate-500 hover:text-noche">
          {mode==='login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </button>
      </div>
    </div>
  )
}
