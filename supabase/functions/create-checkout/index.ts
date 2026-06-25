// Creates a Stripe Checkout Session for the Pro subscription. Auth'd: requires
// the caller's Supabase JWT (verify_jwt on). The client passes `redirectBase`
// (location.origin + import.meta.env.BASE_URL) so success/cancel URLs land back
// in the app under the correct base path.
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

    // Reuse the user's Stripe customer if we have one, else create + record it.
    const { data: sub } = await admin.from('subscriptions')
      .select('stripe_customer_id').eq('user_id', user.id).maybeSingle()
    let customerId = sub?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })
      customerId = customer.id
      await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan: 'free' })
    }

    const { redirectBase } = await req.json().catch(() => ({}))
    const base = (redirectBase || Deno.env.get('SITE_URL') || 'http://localhost:5173/').replace(/\/?$/, '/')

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: Deno.env.get('STRIPE_PRICE_PRO')!, quantity: 1 }],
      success_url: `${base}app?upgraded=1`,
      cancel_url: `${base}app`,
      allow_promotion_codes: true,
    })
    return json({ url: session.url })
  } catch (e) {
    return json({ error: String((e as Error)?.message ?? e) }, 400)
  }
})
