// Returns a Stripe Billing Portal URL so a subscriber can manage/cancel. Auth'd.
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cors, json } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return json({ error: 'Not authenticated' }, 401)

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: sub } = await admin.from('subscriptions')
      .select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
    if (!sub?.stripe_customer_id) return json({ error: 'No billing account yet' }, 400)

    const { redirectBase } = await req.json().catch(() => ({}))
    const base = (redirectBase || Deno.env.get('SITE_URL') || 'http://localhost:5173/').replace(/\/?$/, '/')

    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${base}app`,
    })
    return json({ url: portal.url })
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 400)
  }
})
