// Returns merged busy date ranges for a published property by fetching and
// parsing its iCal feeds server-side (browsers can't fetch arbitrary iCal URLs
// due to CORS). Public endpoint — deploy with **Verify JWT OFF**.
// GET ?slug=<property-slug>  ->  { busy: [{ start, end }] }  (dates: YYYY-MM-DD)
import { createClient } from 'npm:@supabase/supabase-js@2'
import { cors, json } from '../_shared/cors.ts'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  let slug = new URL(req.url).searchParams.get('slug')
  if (!slug) { try { slug = (await req.json())?.slug } catch { /* no body */ } }
  if (!slug) return json({ error: 'slug required' }, 400)

  const { data: prop } = await admin.from('properties')
    .select('ical_urls, published').eq('slug', slug).maybeSingle()
  if (!prop || !prop.published) return json({ busy: [] })

  const feeds = Array.isArray(prop.ical_urls) ? prop.ical_urls : []
  const busy: { start: string; end: string }[] = []
  for (const f of feeds) {
    const url = typeof f === 'string' ? f : f?.url
    if (!url) continue
    try {
      const res = await fetch(url)
      if (res.ok) busy.push(...parseIcsBusy(await res.text()))
    } catch { /* skip unreachable feed */ }
  }
  return json({ busy })
})

function parseIcsBusy(ics: string) {
  const out: { start: string; end: string }[] = []
  // Unfold folded lines (RFC 5545 continuation), then split into VEVENTs.
  const text = ics.replace(/\r?\n[ \t]/g, '')
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const start = matchDate(block, 'DTSTART')
    const end = matchDate(block, 'DTEND')
    if (start) out.push({ start, end: end || start })
  }
  return out
}

function matchDate(block: string, field: string): string | null {
  const m = block.match(new RegExp(field + '[^:\\n]*:([0-9]{8})'))
  if (!m) return null
  const v = m[1]
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`
}
