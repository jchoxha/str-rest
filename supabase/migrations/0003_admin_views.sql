-- str.rest Phase 1: Admin oversight and Master Account management.
-- Idempotent. Run in Supabase SQL editor or `supabase db push`.

-- 1. Add is_admin flag to profiles
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Pre-seed admin flag for admin@str.rest if present
update public.profiles
set is_admin = true
where id in (
  select id from auth.users where email in ('admin@str.rest', 'jeton_hoxha@student.uml.edu')
);

-- 2. Security-definer helper to check if current caller is an admin
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;
grant execute on function public.is_admin() to authenticated;

-- 3. Policy to allow admins to view all profiles
drop policy if exists profiles_admin_select on public.profiles;
create policy profiles_admin_select on public.profiles
  for select using (public.is_admin());

-- 4. Policy to allow admins to view all properties
drop policy if exists properties_admin_select on public.properties;
create policy properties_admin_select on public.properties
  for select using (public.is_admin());

-- 5. Case-insensitive slug resolution for get_public_property and unlock_property
create or replace function public.get_public_property(p_slug text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare result jsonb;
begin
  update public.properties
  set views = views + 1
  where (lower(slug) = lower(p_slug) or regexp_replace(lower(slug), '[^a-z0-9]', '', 'g') = regexp_replace(lower(p_slug), '[^a-z0-9]', '', 'g'))
    and published;

  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'location', p.location,
    'heroImage', p.hero_image,
    'hostNames', p.host_names,
    'layouts', p.layouts,
    'content', (p.content - 'home-details'),
    'showBadge', public.plan_for(p.owner_id) <> 'pro'
  )
  into result
  from public.properties p
  where (lower(p.slug) = lower(p_slug) or regexp_replace(lower(p.slug), '[^a-z0-9]', '', 'g') = regexp_replace(lower(p_slug), '[^a-z0-9]', '', 'g'))
    and p.published
  limit 1;

  return result;
end;
$$;
grant execute on function public.get_public_property(text) to anon, authenticated;

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
  where (lower(p.slug) = lower(p_slug) or regexp_replace(lower(p.slug), '[^a-z0-9]', '', 'g') = regexp_replace(lower(p_slug), '[^a-z0-9]', '', 'g'))
    and p.published
    and lower(trim(p.access_code)) = lower(trim(p_code))
  limit 1;
$$;
grant execute on function public.unlock_property(text, text) to anon, authenticated;
