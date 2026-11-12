-- Pixel Orbit Infinite v4.4 — Friends & authoritative global co-op raid
-- This schema is ALREADY applied to the PixelOrbitServer project.
-- Keep this file as a reproducible reference; do not paste it into production twice
-- unless you understand the existing migrations.

alter table public.pilot_profiles
  add column if not exists raid_tokens integer not null default 0 check (raid_tokens >= 0);

create table if not exists public.coop_raid_state (
  id text primary key check (id = 'global'),
  boss_name text not null default 'НЕБУЛОН',
  hp bigint not null check (hp >= 0),
  max_hp bigint not null check (max_hp > 0),
  phase integer not null default 1 check (phase >= 1),
  total_damage bigint not null default 0 check (total_damage >= 0),
  updated_at timestamptz not null default now(),
  defeated_at timestamptz
);
insert into public.coop_raid_state(id,boss_name,hp,max_hp,phase)
values ('global','НЕБУЛОН',250000,250000,1)
on conflict (id) do nothing;

create table if not exists public.coop_raid_contributions (
  phase integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  damage bigint not null default 0 check (damage >= 0),
  attacks integer not null default 0 check (attacks >= 0),
  last_attack_at timestamptz not null default 'epoch'::timestamptz,
  primary key (phase,user_id)
);
create index if not exists coop_raid_contributions_phase_damage_idx
  on public.coop_raid_contributions(phase,damage desc);
create index if not exists coop_raid_contributions_user_id_idx
  on public.coop_raid_contributions(user_id);

alter table public.coop_raid_state enable row level security;
alter table public.coop_raid_contributions enable row level security;
drop policy if exists "authenticated players read global raid" on public.coop_raid_state;
create policy "authenticated players read global raid"
  on public.coop_raid_state for select to authenticated using (true);
drop policy if exists "authenticated players read raid contributions" on public.coop_raid_contributions;
create policy "authenticated players read raid contributions"
  on public.coop_raid_contributions for select to authenticated using (true);
grant select on public.coop_raid_state,public.coop_raid_contributions to authenticated;

create or replace function public.join_coop_raid()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_state public.coop_raid_state%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'authentication_required' using errcode='28000'; end if;
  select * into v_state from public.coop_raid_state where id='global' for update;
  if v_state.defeated_at is not null and v_state.defeated_at < now()-interval '30 seconds' then
    update public.coop_raid_state
      set phase=phase+1,max_hp=ceil(max_hp*1.2)::bigint,hp=ceil(max_hp*1.2)::bigint,
          boss_name='НЕБУЛОН · ФАЗА '||(phase+1)::text,total_damage=0,defeated_at=null,updated_at=now()
      where id='global' returning * into v_state;
  end if;
  return jsonb_build_object('id',v_state.id,'boss_name',v_state.boss_name,'hp',v_state.hp,
    'max_hp',v_state.max_hp,'phase',v_state.phase,'total_damage',v_state.total_damage,'defeated_at',v_state.defeated_at);
end; $$;

create or replace function public.attack_coop_boss()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid()); v_level integer; v_state public.coop_raid_state%rowtype;
  v_last timestamptz; v_damage bigint; v_applied bigint; v_new_hp bigint;
  v_killed boolean := false; v_tokens integer := 0;
begin
  if v_uid is null then raise exception 'authentication_required' using errcode='28000'; end if;
  select coalesce(level,1) into v_level from public.pilot_profiles where user_id=v_uid;
  if not found then raise exception 'pilot_profile_required' using errcode='P0001'; end if;
  select * into v_state from public.coop_raid_state where id='global' for update;
  if v_state.defeated_at is not null then raise exception 'boss_defeated_wait_for_next_phase' using errcode='P0001'; end if;
  insert into public.coop_raid_contributions(phase,user_id) values(v_state.phase,v_uid) on conflict(phase,user_id) do nothing;
  select last_attack_at into v_last from public.coop_raid_contributions
    where phase=v_state.phase and user_id=v_uid for update;
  if v_last > now()-interval '1.1 seconds' then raise exception 'attack_cooldown' using errcode='P0001'; end if;
  v_damage := least(420,18+least(greatest(v_level,1),120)*3)::bigint;
  v_applied := least(v_state.hp,v_damage); v_new_hp := greatest(0,v_state.hp-v_damage); v_killed := v_new_hp=0;
  update public.coop_raid_state set hp=v_new_hp,total_damage=total_damage+v_applied,
    defeated_at=case when v_killed then now() else null end,updated_at=now()
    where id='global' returning * into v_state;
  update public.coop_raid_contributions set damage=damage+v_applied,attacks=attacks+1,last_attack_at=now()
    where phase=v_state.phase and user_id=v_uid;
  if v_killed then
    update public.pilot_profiles p set raid_tokens=p.raid_tokens+1
    where p.user_id in (select c.user_id from public.coop_raid_contributions c where c.phase=v_state.phase and c.damage>0);
  end if;
  select raid_tokens into v_tokens from public.pilot_profiles where user_id=v_uid;
  return jsonb_build_object('boss_name',v_state.boss_name,'hp',v_state.hp,'max_hp',v_state.max_hp,
    'phase',v_state.phase,'total_damage',v_state.total_damage,'defeated_at',v_state.defeated_at,
    'damage',v_applied,'killed',v_killed,'raid_tokens',coalesce(v_tokens,0));
end; $$;

revoke all on function public.join_coop_raid() from public,anon;
revoke all on function public.attack_coop_boss() from public,anon;
grant execute on function public.join_coop_raid() to authenticated;
grant execute on function public.attack_coop_boss() to authenticated;

grant delete on public.friend_requests to authenticated;
drop policy if exists "friends can remove accepted friendship" on public.friend_requests;
create policy "friends can remove accepted friendship" on public.friend_requests for delete to authenticated
using (status='accepted' and ((select auth.uid())=sender_id or (select auth.uid())=receiver_id));

do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='coop_raid_state') then
    alter publication supabase_realtime add table public.coop_raid_state;
  end if;
end $$;
