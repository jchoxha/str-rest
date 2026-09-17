import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_PROPERTIES, getDemoProperty, unlockDemoProperty } from './demoData'

const LOCAL_PROPS_KEY = 'str_rest_properties_store'
const LOCAL_POSTS_KEY = 'str_rest_guestbook_store'
const LOCAL_SESSION_KEY = 'str_rest_test_session'

function getLocalSession() {
  try {
    const s = localStorage.getItem(LOCAL_SESSION_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

function isTestMode() {
  return Boolean(getLocalSession() || !isSupabaseConfigured)
}

function getStoredProperties() {
  try {
    const raw = localStorage.getItem(LOCAL_PROPS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback to initial
  }
  // Initialize with the 3 demo properties
  const initial = Object.values(DEMO_PROPERTIES).map((p) => ({
    id: p.id,
    owner_id: 'admin-host-001',
    owner_email: 'admin@str.rest',
    slug: p.slug,
    name: p.name,
    location: p.location,
    hero_image: p.hero_image,
    host_names: p.host_names,
    access_code: p.access_code,
    published: true,
    is_demo: p.is_demo || false,
    content: p.content,
    layouts: p.layouts,
    views: 142,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))
  saveStoredProperties(initial)
  return initial
}

function saveStoredProperties(props) {
  try {
    localStorage.setItem(LOCAL_PROPS_KEY, JSON.stringify(props))
  } catch (e) {
    console.warn('Could not save properties to localStorage', e)
  }
}

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'property'
}

// Starter content for a brand-new property so the Site Builder has sections to
// edit immediately. Mirrors the section ids GuestView knows how to render.
export function blankPropertyTemplate() {
  const section = (id, label) => ({ id, visible: true, label })
  return {
    content: {
      'home-details': { previewItems: [], fullItems: [] },
      'house-rules': { rules: [], previewCount: 4 },
      'shop': { title: 'Shop your stay', subtitle: '', items: [] },
      'about-hosts': { hostNames: '', portrait: '', shortBio: '', longBioParagraphs: [], favorites: [], lifestyleImages: [] },
      'gallery': { images: [] },
      'local-recos': { items: [] },
      'other-listings': { properties: [] },
      'direct-booking': { badge: 'Enjoyed your stay?', title: 'Book Your Next Visit Direct', sub: '', btnText: 'Book direct' },
      'guestbook': {},
    },
    layouts: {
      unlocked: [
        section('home-details', 'Your home details'),
        section('house-rules', 'House rules'),
        section('shop', 'Shop your stay'),
        section('about-hosts', 'Your Hosts'),
        section('guestbook', 'Virtual guestbook'),
        section('direct-booking', 'Direct Booking'),
        section('gallery', 'Gallery'),
        section('local-recos', 'Local favorites'),
        section('other-listings', 'Our other places'),
      ],
      booking: [
        section('direct-booking', 'Direct Booking'),
        section('guestbook', 'Virtual guestbook'),
        section('about-hosts', 'Your Hosts'),
        section('gallery', 'Gallery'),
        section('local-recos', 'Local favorites'),
        section('other-listings', 'Other Listings'),
      ],
    },
  }
}

// ---- Host (authenticated) ----------------------------------------------------

export async function listMyProperties() {
  if (isTestMode()) {
    const session = getLocalSession()
    const all = getStoredProperties()
    if (session?.isAdmin) return all
    const uid = session?.user?.id || 'admin-host-001'
    return all.filter(p => p.owner_id === uid || p.is_demo)
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Backend listMyProperties failed, using local store:', err.message)
    return getStoredProperties()
  }
}

export async function getProperty(id) {
  if (isTestMode()) {
    const props = getStoredProperties()
    const match = props.find(p => p.id === id)
    if (match) return match
    throw new Error('Property not found')
  }

  try {
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Backend getProperty failed, using local store:', err.message)
    const props = getStoredProperties()
    const match = props.find(p => p.id === id)
    if (match) return match
    throw err
  }
}

export async function createProperty({ name = 'Untitled property', location = '', accessCode = '', slug = '' } = {}) {
  const session = getLocalSession()
  const tpl = blankPropertyTemplate()
  const finalSlug = slugify(slug || name)

  if (isTestMode() || !isSupabaseConfigured) {
    const props = getStoredProperties()
    const uid = session?.user?.id || 'admin-host-001'
    const newProp = {
      id: 'prop-' + Math.random().toString(36).slice(2, 10),
      owner_id: uid,
      owner_email: session?.user?.email || 'admin@str.rest',
      slug: finalSlug,
      name,
      location,
      access_code: accessCode,
      published: false,
      is_demo: false,
      content: tpl.content,
      layouts: tpl.layouts,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    props.unshift(newProp)
    saveStoredProperties(props)
    return newProp
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: user.id,
        slug: finalSlug,
        name,
        location,
        access_code: accessCode,
        content: tpl.content,
        layouts: tpl.layouts,
      })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Backend createProperty failed, saving locally:', err.message)
    const props = getStoredProperties()
    const newProp = {
      id: 'prop-' + Math.random().toString(36).slice(2, 10),
      owner_id: 'admin-host-001',
      slug: finalSlug,
      name,
      location,
      access_code: accessCode,
      published: false,
      is_demo: false,
      content: tpl.content,
      layouts: tpl.layouts,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    props.unshift(newProp)
    saveStoredProperties(props)
    return newProp
  }
}

export async function updateProperty(id, patch) {
  if (isTestMode()) {
    const props = getStoredProperties()
    const idx = props.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Property not found')
    const updated = { ...props[idx], ...patch, updated_at: new Date().toISOString() }
    props[idx] = updated
    saveStoredProperties(props)
    return updated
  }

  try {
    const { data, error } = await supabase.from('properties').update(patch).eq('id', id).select().single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Backend updateProperty failed, updating local store:', err.message)
    const props = getStoredProperties()
    const idx = props.findIndex(p => p.id === id)
    if (idx !== -1) {
      const updated = { ...props[idx], ...patch, updated_at: new Date().toISOString() }
      props[idx] = updated
      saveStoredProperties(props)
      return updated
    }
    throw err
  }
}

export async function deleteProperty(id) {
  if (isTestMode()) {
    const props = getStoredProperties()
    const filtered = props.filter(p => p.id !== id)
    saveStoredProperties(filtered)
    return
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
  } catch (err) {
    console.warn('Backend deleteProperty failed, deleting from local store:', err.message)
    const props = getStoredProperties()
    const filtered = props.filter(p => p.id !== id)
    saveStoredProperties(filtered)
  }
}

// Uploads image. If in test mode or Supabase is down, converts to base64 DataURL
export async function uploadImage(file, propertyId = 'misc') {
  if (isTestMode() || !isSupabaseConfigured) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not signed in')
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${user.id}/${propertyId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('property-images').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (error) throw error
    const { data } = supabase.storage.from('property-images').getPublicUrl(path)
    return data.publicUrl
  } catch (err) {
    console.warn('Cloud uploadImage failed, falling back to DataURL:', err.message)
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

// ---- Guest (public, via security-definer RPCs with offline fallback) ---------

export async function fetchAvailability(slug) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke('ical-availability', { body: { slug } })
      if (!error && Array.isArray(data?.busy)) return data.busy
    } catch {
      // ignore
    }
  }
  // Mock busy dates so calendar preview is functional
  const now = new Date()
  const addDays = (d, n) => {
    const res = new Date(d)
    res.setDate(res.getDate() + n)
    return res.toISOString().split('T')[0]
  }
  return [
    { start: addDays(now, 4), end: addDays(now, 7) },
    { start: addDays(now, 14), end: addDays(now, 18) },
  ]
}

export async function fetchPublicProperty(slug) {
  // 1. Try bundled demo properties first for instant zero-latency load
  const demo = getDemoProperty(slug)
  if (demo) return demo

  // 2. Try Supabase if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_public_property', { p_slug: slug })
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase fetchPublicProperty failed:', err.message)
    }
  }

  // 3. Fallback to local properties store (checks both exact slug and normalized slug)
  const norm = slugify(slug)
  const props = getStoredProperties()
  const match = props.find(p => p.published && (p.slug === slug || slugify(p.slug) === norm))
  if (match) {
    const pubContent = { ...(match.content || {}) }
    delete pubContent['home-details']
    return {
      id: match.id,
      slug: match.slug,
      name: match.name,
      location: match.location,
      heroImage: match.hero_image,
      hostNames: match.host_names,
      layouts: match.layouts,
      content: pubContent,
      showBadge: false,
    }
  }

  return null
}

export async function unlockProperty(slug, code) {
  // 1. Try demo properties
  const demo = unlockDemoProperty(slug, code)
  if (demo) return demo

  // 2. Try Supabase
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('unlock_property', { p_slug: slug, p_code: code })
      if (!error && data) return data
    } catch (err) {
      console.warn('Supabase unlockProperty failed:', err.message)
    }
  }

  // 3. Fallback to local properties store
  const norm = slugify(slug)
  const props = getStoredProperties()
  const match = props.find(p => p.published && (p.slug === slug || slugify(p.slug) === norm))
  if (match && String(match.access_code).trim().toLowerCase() === String(code).trim().toLowerCase()) {
    return {
      id: match.id,
      slug: match.slug,
      name: match.name,
      location: match.location,
      heroImage: match.hero_image,
      hostNames: match.host_names,
      layouts: match.layouts,
      content: match.content,
      showBadge: false,
    }
  }

  return null
}

// ---- Master Account List (Admin) ---------------------------------------------

export async function listMasterAccounts() {
  const allProps = getStoredProperties()

  // Build simulated master accounts based on known users + demo accounts
  const accountsMap = {
    'admin-host-001': {
      id: 'admin-host-001',
      email: 'admin@str.rest',
      displayName: 'Admin Host',
      plan: 'pro',
      isAdmin: true,
      createdAt: '2026-05-10T12:00:00Z',
      properties: [],
    },
    'demo-host-002': {
      id: 'demo-host-002',
      email: 'demo@str.rest',
      displayName: 'str.rest Demo',
      plan: 'pro',
      isAdmin: false,
      createdAt: '2026-06-01T10:00:00Z',
      properties: [],
    },
    'host-white-mountains': {
      id: 'host-white-mountains',
      email: 'alex.jordan@str.rest',
      displayName: 'Alex & Jordan',
      plan: 'pro',
      isAdmin: false,
      createdAt: '2026-06-12T14:30:00Z',
      properties: [],
    },
  }

  // Map properties into accounts
  allProps.forEach((p) => {
    const ownerId = p.owner_id || 'admin-host-001'
    if (!accountsMap[ownerId]) {
      accountsMap[ownerId] = {
        id: ownerId,
        email: p.owner_email || `${p.slug}@hosts.str.rest`,
        displayName: p.host_names || p.name,
        plan: p.is_demo ? 'pro' : 'free',
        isAdmin: false,
        createdAt: p.created_at || new Date().toISOString(),
        properties: [],
      }
    }
    accountsMap[ownerId].properties.push(p)
  })

  // Also query live profiles if Supabase is connected
  if (isSupabaseConfigured) {
    try {
      const { data: profiles } = await supabase.from('profiles').select('*')
      if (profiles && profiles.length > 0) {
        profiles.forEach(prof => {
          if (!accountsMap[prof.id]) {
            accountsMap[prof.id] = {
              id: prof.id,
              email: prof.email || 'user@example.com',
              displayName: prof.display_name || 'Host',
              plan: 'free',
              isAdmin: Boolean(prof.is_admin),
              createdAt: prof.created_at,
              properties: [],
            }
          }
        })
      }
    } catch {
      // ignore
    }
  }

  return {
    accounts: Object.values(accountsMap),
    properties: allProps,
  }
}

// ---- Guestbook ---------------------------------------------------------------

export async function listPosts(propertyId) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('guestbook_posts')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
      if (!error && data) return data
    } catch {
      // ignore
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY)
    const store = raw ? JSON.parse(raw) : {}
    return store[propertyId] || [
      {
        id: 'post-1',
        property_id: propertyId,
        author: 'Sarah M.',
        body: 'Had an amazing weekend here! The pour-over coffee on the deck was our favorite part.',
        images: [],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'post-2',
        property_id: propertyId,
        author: 'David & Lisa',
        body: 'Super clean, cozy fireplace, and great recommendations for hiking trails nearby.',
        images: [],
        created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
      },
    ]
  } catch {
    return []
  }
}

export async function addPost(propertyId, { author, body, images = [] }) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('guestbook_posts')
        .insert({ property_id: propertyId, author, body, images })
        .select()
        .single()
      if (!error && data) return data
    } catch {
      // ignore
    }
  }

  const raw = localStorage.getItem(LOCAL_POSTS_KEY)
  const store = raw ? JSON.parse(raw) : {}
  const posts = store[propertyId] || []
  const newPost = {
    id: 'post-' + Math.random().toString(36).slice(2),
    property_id: propertyId,
    author: author || 'Guest',
    body,
    images,
    created_at: new Date().toISOString(),
  }
  posts.unshift(newPost)
  store[propertyId] = posts
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(store))
  return newPost
}

export async function deletePost(id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('guestbook_posts').delete().eq('id', id)
      if (!error) return
    } catch {
      // ignore
    }
  }

  const raw = localStorage.getItem(LOCAL_POSTS_KEY)
  if (!raw) return
  const store = JSON.parse(raw)
  for (const pid of Object.keys(store)) {
    store[pid] = store[pid].filter(p => p.id !== id)
  }
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(store))
}
