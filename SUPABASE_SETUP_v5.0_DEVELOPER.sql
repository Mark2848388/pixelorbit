-- PIXEL ORBIT INFINITE v5.0 — FULL DEVELOPER SYSTEM
-- Run once in Supabase SQL Editor. Never expose service_role keys in the client.

create table if not exists public.pixel_developers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('owner','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pixel_dev_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_code text not null check (length(item_code) between 1 and 48),
  quantity integer not null default 0 check (quantity >= 0 and quantity <= 1000000000),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_code)
);

create table if not exists public.pixel_game_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 80),
  description text not null default '' check (length(description) <= 500),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reward_coins bigint not null default 0 check (reward_coins between 0 and 1000000000),
  reward_parts bigint not null default 0 check (reward_parts between 0 and 1000000000),
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint pixel_event_dates check (ends_at > starts_at)
);

create table if not exists public.pixel_world_config (
  world_id integer primary key check (world_id between 0 and 9),
  enabled boolean not null default true,
  coin_multiplier numeric(6,2) not null default 1 check (coin_multiplier between 0.1 and 20),
  enemy_multiplier numeric(6,2) not null default 1 check (enemy_multiplier between 0.1 and 20),
  notice text not null default '' check (length(notice) <= 240),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.pixel_player_flags (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_banned boolean not null default false,
  note text not null default '' check (length(note) <= 500),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.pixel_dev_audit (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users(id),
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.pixel_world_config(world_id)
select n from generate_series(0,9) n on conflict (world_id) do nothing;

alter table public.pixel_developers enable row level security;
alter table public.pixel_dev_items enable row level security;
alter table public.pixel_game_events enable row level security;
alter table public.pixel_world_config enable row level security;
alter table public.pixel_player_flags enable row level security;
alter table public.pixel_dev_audit enable row level security;

drop policy if exists pixel_developers_read_self on public.pixel_developers;
create policy pixel_developers_read_self on public.pixel_developers for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists pixel_items_read_self on public.pixel_dev_items;
create policy pixel_items_read_self on public.pixel_dev_items for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists pixel_events_read_authenticated on public.pixel_game_events;
create policy pixel_events_read_authenticated on public.pixel_game_events for select to authenticated using (true);
drop policy if exists pixel_world_read_authenticated on public.pixel_world_config;
create policy pixel_world_read_authenticated on public.pixel_world_config for select to authenticated using (true);
drop policy if exists pixel_flags_read_self on public.pixel_player_flags;
create policy pixel_flags_read_self on public.pixel_player_flags for select to authenticated using (user_id = (select auth.uid()));
-- No client write policies are intentionally provided for developer-owned data.

grant select on public.pixel_developers, public.pixel_dev_items, public.pixel_game_events, public.pixel_world_config, public.pixel_player_flags to authenticated;
revoke all on public.pixel_dev_audit from anon, authenticated;

create or replace function public.pixel_is_developer()
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('is_developer', exists(
    select 1 from public.pixel_developers d
    where d.user_id = (select auth.uid()) and d.active = true
  ), 'role', (select d.role from public.pixel_developers d where d.user_id = (select auth.uid()) and d.active = true limit 1));
$$;

create or replace function public.pixel_dev_overview()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_role text; v_players bigint; v_events bigint; v_worlds bigint; v_audit jsonb;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  select count(*) into v_players from public.pilot_profiles;
  select count(*) into v_events from public.pixel_game_events where active and ends_at>now();
  select count(*) into v_worlds from public.pixel_world_config where enabled;
  select coalesce(jsonb_agg(x), '[]'::jsonb) into v_audit from (
    select jsonb_build_object('action',a.action,'target',a.target_user_id,'details',a.details,'at',a.created_at) x
    from public.pixel_dev_audit a order by a.created_at desc limit 12
  ) q;
  return jsonb_build_object('role',v_role,'players',v_players,'active_events',v_events,'enabled_worlds',v_worlds,'audit',v_audit,'user_id',(select auth.uid()));
end $$;

create or replace function public.pixel_dev_list_players()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_role text; v_rows jsonb;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  select coalesce(jsonb_agg(x),'[]'::jsonb) into v_rows from (
    select jsonb_build_object('user_id',p.user_id,'pilot_code',p.pilot_code,'display_name',p.display_name,'level',p.level,'last_seen',p.last_seen,'is_banned',coalesce(f.is_banned,false),'note',coalesce(f.note,'')) x
    from public.pilot_profiles p left join public.pixel_player_flags f on f.user_id=p.user_id
    order by p.last_seen desc nulls last limit 100
  ) q;
  return v_rows;
end $$;

create or replace function public.pixel_dev_grant_resources(p_target uuid,p_coins bigint,p_parts bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text; v_save jsonb;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_coins<0 or p_parts<0 or p_coins>1000000000 or p_parts>1000000000 then raise exception 'invalid_resource_amount'; end if;
  update public.cloud_saves c set save_data=jsonb_set(jsonb_set(coalesce(c.save_data,'{}'::jsonb),'{coins}',to_jsonb(greatest(0,coalesce((c.save_data->>'coins')::numeric,0)+p_coins)),true),'{parts}',to_jsonb(greatest(0,coalesce((c.save_data->>'parts')::numeric,0)+p_parts)),true),updated_at=now()
  where c.user_id=p_target returning c.save_data into v_save;
  if not found then raise exception 'target_has_no_cloud_save'; end if;
  insert into public.pixel_dev_audit(actor_id,action,target_user_id,details) values ((select auth.uid()),'grant_resources',p_target,jsonb_build_object('coins',p_coins,'parts',p_parts));
  return jsonb_build_object('success',true,'coins',v_save->'coins','parts',v_save->'parts');
end $$;

create or replace function public.pixel_dev_grant_item(p_target uuid,p_item_code text,p_quantity integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_quantity<1 or p_quantity>1000000000 or length(p_item_code) not between 1 and 48 then raise exception 'invalid_item'; end if;
  insert into public.pixel_dev_items(user_id,item_code,quantity) values(p_target,p_item_code,p_quantity)
  on conflict(user_id,item_code) do update set quantity=least(1000000000,public.pixel_dev_items.quantity+excluded.quantity),updated_at=now();
  insert into public.pixel_dev_audit(actor_id,action,target_user_id,details) values ((select auth.uid()),'grant_item',p_target,jsonb_build_object('item_code',p_item_code,'quantity',p_quantity));
  return jsonb_build_object('success',true);
end $$;

create or replace function public.pixel_dev_set_player(p_target uuid,p_banned boolean,p_note text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_target=(select auth.uid()) and p_banned then raise exception 'cannot_ban_self'; end if;
  insert into public.pixel_player_flags(user_id,is_banned,note,updated_by) values(p_target,p_banned,left(coalesce(p_note,''),500),(select auth.uid()))
  on conflict(user_id) do update set is_banned=excluded.is_banned,note=excluded.note,updated_by=excluded.updated_by,updated_at=now();
  insert into public.pixel_dev_audit(actor_id,action,target_user_id,details) values ((select auth.uid()),'set_player_status',p_target,jsonb_build_object('banned',p_banned,'note',left(coalesce(p_note,''),500)));
  return jsonb_build_object('success',true,'is_banned',p_banned);
end $$;

create or replace function public.pixel_dev_create_event(p_title text,p_description text,p_starts_at timestamptz,p_ends_at timestamptz,p_reward_coins bigint,p_reward_parts bigint)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text; v_id uuid;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_ends_at<=p_starts_at then raise exception 'invalid_event_dates'; end if;
  insert into public.pixel_game_events(title,description,starts_at,ends_at,reward_coins,reward_parts,created_by)
  values(left(p_title,80),left(coalesce(p_description,''),500),p_starts_at,p_ends_at,p_reward_coins,p_reward_parts,(select auth.uid())) returning id into v_id;
  insert into public.pixel_dev_audit(actor_id,action,details) values ((select auth.uid()),'create_event',jsonb_build_object('event_id',v_id,'title',p_title));
  return jsonb_build_object('success',true,'event_id',v_id);
end $$;

create or replace function public.pixel_dev_set_world(p_world_id integer,p_enabled boolean,p_coin_multiplier numeric,p_enemy_multiplier numeric,p_notice text default '')
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_world_id not between 0 and 9 or p_coin_multiplier not between 0.1 and 20 or p_enemy_multiplier not between 0.1 and 20 then raise exception 'invalid_world_settings'; end if;
  insert into public.pixel_world_config(world_id,enabled,coin_multiplier,enemy_multiplier,notice,updated_by)
  values(p_world_id,p_enabled,p_coin_multiplier,p_enemy_multiplier,left(coalesce(p_notice,''),240),(select auth.uid()))
  on conflict(world_id) do update set enabled=excluded.enabled,coin_multiplier=excluded.coin_multiplier,enemy_multiplier=excluded.enemy_multiplier,notice=excluded.notice,updated_by=excluded.updated_by,updated_at=now();
  insert into public.pixel_dev_audit(actor_id,action,details) values ((select auth.uid()),'set_world',jsonb_build_object('world_id',p_world_id,'enabled',p_enabled,'coin_multiplier',p_coin_multiplier,'enemy_multiplier',p_enemy_multiplier));
  return jsonb_build_object('success',true);
end $$;

-- SECURITY DEFINER functions are guarded internally by the developer table.
revoke all on function public.pixel_is_developer() from public, anon;
revoke all on function public.pixel_dev_overview() from public, anon;
revoke all on function public.pixel_dev_list_players() from public, anon;
revoke all on function public.pixel_dev_grant_resources(uuid,bigint,bigint) from public, anon;
revoke all on function public.pixel_dev_grant_item(uuid,text,integer) from public, anon;
revoke all on function public.pixel_dev_set_player(uuid,boolean,text) from public, anon;
revoke all on function public.pixel_dev_create_event(text,text,timestamptz,timestamptz,bigint,bigint) from public, anon;
revoke all on function public.pixel_dev_set_world(integer,boolean,numeric,numeric,text) from public, anon;
grant execute on function public.pixel_is_developer() to authenticated;
grant execute on function public.pixel_dev_overview() to authenticated;
grant execute on function public.pixel_dev_list_players() to authenticated;
grant execute on function public.pixel_dev_grant_resources(uuid,bigint,bigint) to authenticated;
grant execute on function public.pixel_dev_grant_item(uuid,text,integer) to authenticated;
grant execute on function public.pixel_dev_set_player(uuid,boolean,text) to authenticated;
grant execute on function public.pixel_dev_create_event(text,text,timestamptz,timestamptz,bigint,bigint) to authenticated;
grant execute on function public.pixel_dev_set_world(integer,boolean,numeric,numeric,text) to authenticated;

-- IMPORTANT: after registering/logging into your own account, copy its UID from the Developer panel
-- and run this single statement manually as project owner in SQL Editor:
-- insert into public.pixel_developers(user_id, role, active) values ('YOUR_AUTH_USER_UUID','owner',true)
-- on conflict(user_id) do update set role='owner', active=true;


-- v5.0 ITEM CATALOG (included in the second migration)
create table if not exists public.pixel_item_catalog (
  item_code text primary key check (length(item_code) between 1 and 48),
  title text not null check (length(title) between 1 and 80),
  description text not null default '' check (length(description) <= 300),
  rarity text not null default 'common' check (rarity in ('common','uncommon','rare','epic','legendary','mythic')),
  active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.pixel_item_catalog enable row level security;
drop policy if exists pixel_item_catalog_read_active on public.pixel_item_catalog;
create policy pixel_item_catalog_read_active on public.pixel_item_catalog for select to authenticated using (active=true);
grant select on public.pixel_item_catalog to authenticated;
create or replace function public.pixel_dev_create_item(p_code text,p_title text,p_description text,p_rarity text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if length(p_code) not between 1 and 48 or length(p_title) not between 1 and 80 or p_rarity not in ('common','uncommon','rare','epic','legendary','mythic') then raise exception 'invalid_item_definition'; end if;
  insert into public.pixel_item_catalog(item_code,title,description,rarity,created_by) values(lower(p_code),p_title,left(coalesce(p_description,''),300),p_rarity,(select auth.uid())) on conflict(item_code) do update set title=excluded.title,description=excluded.description,rarity=excluded.rarity,active=true;
  insert into public.pixel_dev_audit(actor_id,action,details) values ((select auth.uid()),'create_item',jsonb_build_object('item_code',lower(p_code),'title',p_title,'rarity',p_rarity));
  return jsonb_build_object('success',true,'item_code',lower(p_code));
end $$;
revoke all on function public.pixel_dev_create_item(text,text,text,text) from public,anon;
grant execute on function public.pixel_dev_create_item(text,text,text,text) to authenticated;
create or replace function public.pixel_dev_grant_item(p_target uuid,p_item_code text,p_quantity integer)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_role text;
begin
  select d.role into v_role from public.pixel_developers d where d.user_id=(select auth.uid()) and d.active=true;
  if v_role is null then raise exception 'developer_access_required'; end if;
  if p_quantity<1 or p_quantity>1000000000 or length(p_item_code) not between 1 and 48 then raise exception 'invalid_item'; end if;
  if not exists(select 1 from public.pixel_item_catalog c where c.item_code=lower(p_item_code) and c.active=true) then raise exception 'item_not_in_catalog'; end if;
  insert into public.pixel_dev_items(user_id,item_code,quantity) values(p_target,lower(p_item_code),p_quantity) on conflict(user_id,item_code) do update set quantity=least(1000000000,public.pixel_dev_items.quantity+excluded.quantity),updated_at=now();
  insert into public.pixel_dev_audit(actor_id,action,target_user_id,details) values ((select auth.uid()),'grant_item',p_target,jsonb_build_object('item_code',lower(p_item_code),'quantity',p_quantity));
  return jsonb_build_object('success',true);
end $$;
revoke all on function public.pixel_dev_grant_item(uuid,text,integer) from public,anon;
grant execute on function public.pixel_dev_grant_item(uuid,text,integer) to authenticated;
