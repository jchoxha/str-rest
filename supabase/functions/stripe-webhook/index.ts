// Stripe webhook → keeps the `subscriptions` table in sync. Public endpoint:
// Stripe can't send a Supabase JWT, so deploy this with **Verify JWT OFF**
// (dashboard toggle, or `verify_jwt = false` in supabase/config.toml).
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  const body = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (e) {
    return new Response(`Webhook signature error: ${(e as Error).message}`, { status: 400 })
  }

  const syncSubscription = async (sub: Stripe.Subscription) => {
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    // Map the Stripe customer back to our user.
    const { data: row } = await admin.from('subscriptions')
      .select('user_id').eq('stripe_customer_id', customerId).maybeSingle()
    let userId = row?.user_id
    if (!userId) {
      const cust = await stripe.customers.retrieve(customerId)
      userId = (cust as Stripe.Customer)?.metadata?.user_id
    }
    if (!userId) return
    const active = ['active', 'trialing'].includes(sub.status)
    await admin.from('subscriptions').upsert({
      user_id: userId,
      plan: active ? 'pro' : 'free',
      status: sub.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(sub)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
    }
  } catch (e) {
    return new Response(`Handler error: ${(e as Error).message}`, { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } })
})
