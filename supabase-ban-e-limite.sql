-- ============================================================
-- Forja de Cartas — BANIMENTO + LIMITE ANTI-SPAM
-- Pré-requisito: supabase-moderation.sql já aplicado (coluna
-- "blocked" em cards e tabela reports).
-- Rode no Supabase: SQL Editor → cole tudo → Run.
-- ============================================================

-- ---------- 1) coluna de banimento ----------
alter table public.profiles add column if not exists is_banned boolean not null default false;

-- ---------- 2) RPC: apenas ADMINS banem/desbanem ----------
-- security definer: roda como dono da função, então funciona mesmo com o
-- UPDATE de profiles restrito por coluna (correção de segurança anterior).
create or replace function public.admin_set_banned(target uuid, banned boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin) then
    raise exception 'apenas administradores podem banir';
  end if;
  update public.profiles set is_banned = banned where id = target;
end $$;
revoke all on function public.admin_set_banned(uuid, boolean) from public;
grant execute on function public.admin_set_banned(uuid, boolean) to authenticated;

-- ---------- 3) cartas públicas de banidos somem da galeria/coleções ----------
drop policy if exists "ler cartas próprias ou públicas" on public.cards;
create policy "ler cartas próprias ou públicas" on public.cards for select using (
  auth.uid() = user_id
  or (
    not blocked
    and not exists (select 1 from public.profiles pb where pb.id = cards.user_id and pb.is_banned)
    and (
      is_public
      or exists (
        select 1 from public.collection_cards cc
        join public.collections c on c.id = cc.collection_id
        where cc.card_id = cards.id and c.is_public
      )
    )
  )
);

-- ---------- 4) guarda de INSERT: banido não salva + 100 cartas / 6 horas ----------
create or replace function public.guard_card_insert() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if exists (select 1 from public.profiles p where p.id = new.user_id and p.is_banned) then
    raise exception 'USUARIO_BANIDO';
  end if;
  select count(*) into n from public.cards
    where user_id = new.user_id and created_at > now() - interval '6 hours';
  if n >= 100 then
    raise exception 'LIMITE_CARTAS';
  end if;
  return new;
end $$;
drop trigger if exists on_card_insert_guard on public.cards;
create trigger on_card_insert_guard before insert on public.cards
  for each row execute procedure public.guard_card_insert();

-- ----- VERIFICAÇÃO (opcional) -----
-- select admin_set_banned('<uuid>', true);  -- como não-admin deve FALHAR
