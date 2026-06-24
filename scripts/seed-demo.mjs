// Seeds the public demo account: creates a demo host, uploads sample images to
// Storage, and inserts the three sample properties (published).
//
// Run with the SERVICE ROLE key (bypasses RLS) — never ship this key to the
// client:
//   VITE_SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...  node scripts/seed-demo.mjs
//
// Safe to re-run: it replaces the demo user's properties and re-uploads images.

import { createClient } from '@supabase/supabase-js'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { buildDemoProperties } from './demo-data.mjs'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing env: set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const DEMO_EMAIL = 'demo@str.rest'
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'str-rest-demo-' + Math.random().toString(36).slice(2)
const BUCKET = 'property-images'
const ASSETS = ['tiny_home.png', 'velvet_pillow.png', 'pour_over.png', 'tiny_home_kitchen.png', 'mountain_view_deck.png', 'riverside_brewery.png', 'host_portrait.png']

const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
const here = dirname(fileURLToPath(import.meta.url))
const assetsDir = join(here, '..', 'src', 'assets')

async function ensureDemoUser() {
  // Look for an existing demo user first.
  const { data: list } = await admin.auth.admin.listUsers()
  const existing = list?.users?.find(u => u.email === DEMO_EMAIL)
  if (existing) {
    console.log('Using existing demo user', existing.id)
    return existing.id
  }
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: 'str.rest Demo' },
  })
  if (error) throw error
  console.log('Created demo user', data.user.id, '(password:', DEMO_PASSWORD + ')')
  return data.user.id
}

async function uploadAssets(ownerId) {
  const urls = {}
  for (const file of ASSETS) {
    const buf = await readFile(join(assetsDir, file))
    const path = `${ownerId}/demo/${file}`
    const { error } = await admin.storage.from(BUCKET).upload(path, buf, {
      contentType: 'image/png',
      upsert: true,
    })
    if (error) throw error
    urls[file] = admin.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  }
  console.log(`Uploaded ${ASSETS.length} images`)
  return urls
}

async function main() {
  const ownerId = await ensureDemoUser()
  const urls = await uploadAssets(ownerId)
  const img = (file) => urls[file]

  // Clear any previous demo properties so slugs and content are fresh.
  await admin.from('properties').delete().eq('owner_id', ownerId)

  const props = buildDemoProperties(img).map(p => ({ ...p, owner_id: ownerId, is_demo: true, published: true }))
  const { data, error } = await admin.from('properties').insert(props).select('slug, name')
  if (error) throw error

  console.log('\nSeeded properties:')
  for (const row of data) console.log(`  /p/${row.slug}  —  ${row.name}`)
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
