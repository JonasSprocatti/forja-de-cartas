-- ============================================================
-- Forja de Cartas — CURTIDAS + DENÚNCIAS / MODERAÇÃO (incremental)
-- Rode depois dos outros SQLs. Cole no SQL Editor → Run.
-- ============================================================

-- ---------- CURTIDAS (votação rápida) ----------
create table if not exists public.likes (
  card_id    uuid not null references public.cards on delete cascade,
  user_id    uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  primary key (card_id, user_id)
);
alter table public.likes enable row level security;
drop policy if exists "curtidas visíveis" on public.likes;
create policy "curtidas visíveis" on public.likes for select using (true);
drop policy if exists "curtir como você" on public.likes;
create policy "curtir como você" on public.likes for insert with check (auth.uid() = user_id);
drop policy if exists "descurtir o próprio" on public.likes;
create policy "descurtir o próprio" on public.likes for delete using (auth.uid() = user_id);

create or replace view public.card_likes as
  select card_id, count(*)::int as likes from public.likes group by card_id;

-- ---------- ADMIN + BLOQUEIO ----------
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.cards    add column if not exists blocked  boolean not null default false;

-- ---------- DENÚNCIAS ----------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards on delete cascade,
  reporter_id uuid not null references auth.users on delete cascade,
  reason      text,
  created_at  timestamptz not null default now(),
  unique (card_id, reporter_id)
);
alter table public.reports enable row level security;
drop policy if exists "denunciar autenticado" on public.reports;
create policy "denunciar autenticado" on public.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists "admins leem denúncias" on public.reports;
create policy "admins leem denúncias" on public.reports for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- auto-oculta a carta quando atingir 3 denunciantes distintos
create or replace function public.check_reports()
returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  select count(*) into n from public.reports where card_id = new.card_id;
  if n >= 3 then update public.cards set blocked = true where id = new.card_id; end if;
  return new;
end; $$;
drop trigger if exists on_report_insert on public.reports;
create trigger on_report_insert after insert on public.reports
  for each row execute procedure public.check_reports();

-- ---------- ADMINS GERENCIAM CARTAS (desbloquear / excluir) ----------
drop policy if exists "admins atualizam cartas" on public.cards;
create policy "admins atualizam cartas" on public.cards for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);
drop policy if exists "admins apagam cartas" on public.cards;
create policy "admins apagam cartas" on public.cards for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- admins leem qualquer carta (para revisar conteúdo bloqueado)
drop policy if exists "admins leem cartas" on public.cards;
create policy "admins leem cartas" on public.cards for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
);

-- ---------- LEITURA PÚBLICA: esconder cartas bloqueadas ----------
drop policy if exists "ler cartas próprias ou públicas" on public.cards;
create policy "ler cartas próprias ou públicas" on public.cards for select using (
  auth.uid() = user_id
  or (
    not blocked and (
      is_public
      or exists (
        select 1 from public.collection_cards cc
        join public.collections c on c.id = cc.collection_id
        where cc.card_id = cards.id and c.is_public
      )
    )
  )
);

-- Para se tornar admin: Table Editor → profiles → is_admin = true na sua linha.
