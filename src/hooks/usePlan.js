import { useEffect, useState } from 'react'
import { getMyPlan } from '../lib/billing'
import { useAuth } from '../auth/auth-context'

// Exposes the current user's plan. `loading` is derived (no synchronous
// setState in the effect) so it plays nicely with the lint rules.
export function usePlan() {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    let active = true
    getMyPlan()
      .then(p => { if (active) setPlan(p.plan) })
      .catch(() => {})
      .finally(() => { if (active) setLoaded(true) })
    return () => { active = false }
  }, [user])

  return { plan, isPro: plan === 'pro', loading: !!user && !loaded }
}
