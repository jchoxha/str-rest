-- str.rest initial schema: profiles, properties, guestbook, guest RPCs, storage.
-- Safe to run more than once (idempotent guards throughout).
-- Apply in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- PROFILES (one row per auth user)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

-- Create a profile automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- PROPERTIES (content + layouts kept as JSONB, mirroring the prototype shape)
-- ---------------------------------------------------------------------------
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,
  name text not null default 'Untitled property',
  location text default '',
  hero_image text default '',
  host_names text default '',
  access_code text default '',
  is_demo boolean not null default false,
  published boolean not null default false,
  content jsonb not null default '{}'::jsonb,
  layouts jsonb not null default '{"unlocked":[],"booking":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_owner_idx on public.properties(owner_id);

alter table public.properties enable row level security;

-- Owners get full access to their own rows. There is deliberately NO anon/
-- public policy: guests read through the security-definer RPCs below so that
-- sensitive fields never leave the database unprotected.
drop policy if exists properties_owner_all on public.properties;
create policy properties_owner_all on public.properties
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Slug helpers ---------------------------------------------------------------
create or replace function public.slugify(txt text)
returns text language sql immutable as $$
  select trim(both '-' from regexp_replace(lower(coalesce(txt, '')), '[^a-z0-9]+', '-', 'g'));
$$;

create or replace function public.set_property_slug()
returns trigger language plpgsql as $$
declare
  base text;
  candidate text;
  n int := 1;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  base := public.slugify(new.name);
  if base = '' then base := 'property'; end if;
  candidate := base;
  while exists (select 1 from public.properties where slug = candidate and id <> new.id) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists properties_set_slug on public.properties;
create trigger properties_set_slug
  before insert on public.properties
  for each row execute function public.set_property_slug();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists properties_touch on public.properties;
create trigger properties_touch
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- GUESTBOOK
-- ---------------------------------------------------------------------------
create table if not exists public.guestbook_posts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  author text not null default 'Guest',
  body text not null,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists guestbook_property_idx on public.guestbook_posts(property_id);

alter table public.guestbook_posts enable row level security;

drop policy if exists guestbook_public_select on public.guestbook_posts;
create policy guestbook_public_select on public.guestbook_posts
  for select using (
    exists (select 1 from public.properties p where p.id = property_id and p.published)
  );

drop policy if exists guestbook_public_insert on public.guestbook_posts;
create policy guestbook_public_insert on public.guestbook_posts
  for insert with check (
    exists (select 1 from public.properties p where p.id = property_id and p.published)
  );

drop policy if exists guestbook_owner_delete on public.guestbook_posts;
create policy guestbook_owner_delete on public.guestbook_posts
  for delete using (
    exists (select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- GUEST RPCs (security definer): the only way the public reads properties.
-- ---------------------------------------------------------------------------
-- Marketing/booking view: published property WITHOUT the sensitive
-- `home-details` section (Wi-Fi, door codes, etc.).
create or replace function public.get_public_property(p_slug text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'location', p.location,
    'heroImage', p.hero_image,
    'hostNames', p.host_names,
    'layouts', p.layouts,
    'content', (p.content - 'home-details')
  )
  from public.properties p
  where p.slug = p_slug and p.published
  limit 1;
$$;

-- Unlocked view: full content (incl. home-details) only when the code matches.
create or replace function public.unlock_property(p_slug text, p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'location', p.location,
    'heroImage', p.hero_image,
    'hostNames', p.host_names,
    'layouts', p.layouts,
    'content', p.content
  )
  from public.properties p
  where p.slug = p_slug
    and p.published
    and coalesce(p.access_code, '') <> ''
    and lower(p.access_code) = lower(coalesce(p_code, ''))
  limit 1;
$$;

grant execute on function public.get_public_property(text) to anon, authenticated;
grant execute on function public.unlock_property(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- STORAGE: public-read image bucket; writes scoped to the owner's folder.
-- Uploads must be keyed as `<auth.uid()>/<...>` so a user can only write to
-- their own prefix.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

drop policy if exists property_images_public_read on storage.objects;
create policy property_images_public_read on storage.objects
  for select using (bucket_id = 'property-images');

drop policy if exists property_images_owner_write on storage.objects;
create policy property_images_owner_write on storage.objects
  for insert to authenticated with check (
    bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists property_images_owner_update on storage.objects;
create policy property_images_owner_update on storage.objects
  for update to authenticated using (
    bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists property_images_owner_delete on storage.objects;
create policy property_images_owner_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'property-images' and (storage.foldername(name))[1] = auth.uid()::text
  );
