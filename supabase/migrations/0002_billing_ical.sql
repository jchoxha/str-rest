-- str.rest Phase 0: billing/plan gating, iCal feeds, and view counts.
-- Apply after 0001. Idempotent. Run in the Supabase SQL editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- SUBSCRIPTIONS — written ONLY by the Stripe webhook (service role). Clients
-- can read their own row but cannot write, so a user can't self-upgrade.
-- ---------------------------------------------------------------------------
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free',          -- 'free' | 'pro'
  status text,                                 -- Stripe subscription status
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own on public.subscriptions
  for select using (auth.uid() = user_id);
-- (No insert/update/delete policies: only the service-role webhook writes.)

-- Effective plan for a user: 'pro' only when a subscription is active/trialing.
create or replace function public.plan_for(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select case
              when s.plan = 'pro' and (s.status is null or s.status in ('active', 'trialing'))
              then 'pro' else 'free'
            end
       from public.subscriptions s where s.user_id = uid),
    'free'
  );
$$;
grant execute on function public.plan_for(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- FREE-PLAN PROPERTY LIMIT (server-side, so the REST API can't bypass it).
-- Demo properties are exempt so the seed script can insert all three.
-- ---------------------------------------------------------------------------
create or replace function public.enforce_property_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare cnt int;
begin
  if new.is_demo or public.plan_for(new.owner_id) = 'pro' then
    return new;
  end if;
  select count(*) into cnt from public.properties where owner_id = new.owner_id;
  if cnt >= 1 then
    raise exception 'Free plan is limited to 1 property. Upgrade to Pro for unlimited.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists properties_limit on public.properties;
create trigger properties_limit before insert on public.properties
  for each row execute function public.enforce_property_limit();

-- ---------------------------------------------------------------------------
-- iCal feeds + view counter on properties.
-- ---------------------------------------------------------------------------
alter table public.properties add column if not exists ical_urls jsonb not null default '[]'::jsonb;
alter table public.properties add column if not exists views integer not null default 0;

-- ---------------------------------------------------------------------------
-- Public property RPC: now also bumps the view counter and reports whether the
-- "Powered by str.rest" badge should show (free owners only). Still strips the
-- sensitive home-details section. (Volatile because it writes the counter.)
-- ---------------------------------------------------------------------------
create or replace function public.get_public_property(p_slug text)
returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare result jsonb;
begin
  update public.properties set views = views + 1 where slug = p_slug and published;

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
  where p.slug = p_slug and p.published
  limit 1;

  return result;
end;
$$;
grant execute on function public.get_public_property(text) to anon, authenticated;
