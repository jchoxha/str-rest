import { supabase } from './supabase'

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
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getProperty(id) {
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createProperty({ name = 'Untitled property', location = '', accessCode = '' } = {}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')
  const tpl = blankPropertyTemplate()
  const { data, error } = await supabase
    .from('properties')
    .insert({
      owner_id: user.id,
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
}

export async function updateProperty(id, patch) {
  const { data, error } = await supabase.from('properties').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}

// Uploads to `<userId>/<propertyId>/<uuid>.<ext>` (matches the storage RLS
// policy) and returns the public URL to store in content.
export async function uploadImage(file, propertyId = 'misc') {
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
}

// ---- Guest (public, via security-definer RPCs) -------------------------------

// Busy date ranges from the property's iCal feeds (Pro). Returns [] on any
// failure so the booking UI degrades gracefully.
export async function fetchAvailability(slug) {
  try {
    const { data, error } = await supabase.functions.invoke('ical-availability', { body: { slug } })
    if (error) return []
    return Array.isArray(data?.busy) ? data.busy : []
  } catch {
    return []
  }
}

export async function fetchPublicProperty(slug) {
  const { data, error } = await supabase.rpc('get_public_property', { p_slug: slug })
  if (error) throw error
  return data // jsonb object, or null if not found / unpublished
}

export async function unlockProperty(slug, code) {
  const { data, error } = await supabase.rpc('unlock_property', { p_slug: slug, p_code: code })
  if (error) throw error
  return data // full content if code matches, else null
}

// ---- Guestbook ---------------------------------------------------------------

export async function listPosts(propertyId) {
  const { data, error } = await supabase
    .from('guestbook_posts')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addPost(propertyId, { author, body, images = [] }) {
  const { data, error } = await supabase
    .from('guestbook_posts')
    .insert({ property_id: propertyId, author, body, images })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePost(id) {
  const { error } = await supabase.from('guestbook_posts').delete().eq('id', id)
  if (error) throw error
}
