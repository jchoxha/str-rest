import { Link } from 'react-router-dom'
import { useAuth } from '../auth/auth-context'

const features = [
  { icon: '🏡', title: 'Digital guidebook', desc: 'Wi-Fi, door codes, house rules and local tips — everything your guests need, in one link.' },
  { icon: '🛍️', title: 'Shop your stay', desc: 'Earn affiliate revenue from the products guests love in your space.' },
  { icon: '📅', title: 'Direct bookings', desc: 'Convert past guests into repeat stays and skip the platform fees.' },
  { icon: '🔒', title: 'Code-protected info', desc: 'Sensitive details stay hidden until a guest enters the access code you send them.' },
]

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', maxWidth: 1040, margin: '0 auto' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>str.rest</div>
        <nav style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user
            ? <Link to="/app" style={btnPrimary}>Go to dashboard</Link>
            : <>
                <Link to="/login" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: 14 }}>Log in</Link>
                <Link to="/login" style={btnPrimary}>Get started</Link>
              </>}
        </nav>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '64px 24px' }}>
        <section style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 14 }}>
            For short-term rental hosts
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0, maxWidth: 720, marginInline: 'auto' }}>
            One link that gives your guests everything.
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 560, margin: '18px auto 32px' }}>
            Build a beautiful digital guidebook, sell your favorite products, and take direct bookings — no code required.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user ? '/app' : '/login'} style={{ ...btnPrimary, padding: '12px 22px', fontSize: 15 }}>
              {user ? 'Go to dashboard' : 'Create your guidebook'}
            </Link>
            <Link to="/p/the-littleton-tiny-home" style={btnGhost}>View a live demo →</Link>
          </div>
        </section>

        <section style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </section>
      </main>

      <footer style={{ borderTop: '1px solid #1e293b', padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        Powered by str.rest
      </footer>
    </div>
  )
}

const btnPrimary = { background: '#3b82f6', color: '#fff', textDecoration: 'none', padding: '9px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }
const btnGhost = { background: 'transparent', color: '#e2e8f0', textDecoration: 'none', padding: '12px 22px', borderRadius: 8, fontSize: 15, border: '1px solid #334155' }
