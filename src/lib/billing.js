import { supabase } from './supabase'

// Where Stripe should send the user back (app root under the Pages base path).
const redirectBase = () => `${window.location.origin}${import.meta.env.BASE_URL}`

// Reads the caller's plan from their own subscriptions row (mirrors the
// server-side plan_for() logic). Defaults to 'free'.
export async function getMyPlan() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { plan: 'free', status: null, currentPeriodEnd: null }
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()
  const active = !data?.status || ['active', 'trialing'].includes(data.status)
  const plan = data?.plan === 'pro' && active ? 'pro' : 'free'
  return { plan, status: data?.status ?? null, currentPeriodEnd: data?.current_period_end ?? null }
}

export async function startCheckout() {
  const { data, error } = await supabase.functions.invoke('create-checkout', {
    body: { redirectBase: redirectBase() },
  })
  if (error) throw error
  if (!data?.url) throw new Error(data?.error || 'Could not start checkout')
  window.location.href = data.url
}

export async function openPortal() {
  const { data, error } = await supabase.functions.invoke('create-portal', {
    body: { redirectBase: redirectBase() },
  })
  if (error) throw error
  if (!data?.url) throw new Error(data?.error || 'Could not open billing portal')
  window.location.href = data.url
}
