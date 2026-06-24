import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../auth/auth-context'

// Where Supabase should send the user back after a magic link / OAuth round
// trip — the app root under the Pages base path.
const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`

export default function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Already signed in (or just became signed in) → go to the dashboard.
  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  const passwordSubmit = async (e) => {
    e.preventDefault()
    setError(''); setNotice(''); setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        if (error) throw error
        setNotice('Account created. If email confirmation is on, check your inbox — otherwise you can sign in now.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const magicLink = async () => {
    if (!email) { setError('Enter your email first.'); return }
    setError(''); setNotice(''); setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
      if (error) throw error
      setNotice('Magic link sent — check your email.')
    } catch (err) {
      setError(err.message || 'Could not send magic link.')
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setError(''); setNotice('')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) setError(error.message)
  }

  return (
    <div style={page}>
      <div style={card}>
        <Link to="/" style={{ color: '#60a5fa', fontSize: 13, textDecoration: 'none' }}>← str.rest</Link>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9', margin: '12px 0 4px' }}>
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
          {mode === 'signup' ? 'Start building your guidebook.' : 'Sign in to manage your properties.'}
        </p>

        {!isSupabaseConfigured && (
          <div style={warn}>
            Supabase isn't configured. Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> (see SUPABASE_SETUP.md) and restart the dev server.
          </div>
        )}

        <form onSubmit={passwordSubmit}>
          <label style={label}>Email</label>
          <input style={input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
          <label style={label}>Password</label>
          <input style={input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />

          {error && <div style={errBox}>{error}</div>}
          {notice && <div style={noticeBox}>{notice}</div>}

          <button style={primaryBtn} type="submit" disabled={busy || !isSupabaseConfigured}>
            {busy ? 'Working…' : mode === 'signup' ? 'Sign up' : 'Sign in'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button style={secondaryBtn} onClick={magicLink} disabled={busy || !isSupabaseConfigured}>Email magic link</button>
          <button style={secondaryBtn} onClick={google} disabled={!isSupabaseConfigured}>Continue with Google</button>
        </div>

        <div style={{ marginTop: 18, fontSize: 13, color: '#94a3b8' }}>
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setNotice('') }}
            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontSize: 13 }}
          >
            {mode === 'signup' ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </div>
    </div>
  )
}

const page = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: 24 }
const card = { width: '100%', maxWidth: 400, background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32 }
const label = { display: 'block', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '14px 0 6px' }
const input = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #334155', background: '#0f172a', color: '#f1f5f9', fontSize: 14, boxSizing: 'border-box' }
const primaryBtn = { width: '100%', marginTop: 18, padding: '11px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }
const secondaryBtn = { flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', fontSize: 13, cursor: 'pointer' }
const errBox = { marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.4)', color: '#fca5a5', fontSize: 13 }
const noticeBox = { marginTop: 14, padding: '10px 12px', borderRadius: 8, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.4)', color: '#6ee7b7', fontSize: 13 }
const warn = { marginBottom: 16, padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.4)', color: '#fcd34d', fontSize: 12.5, lineHeight: 1.5 }
