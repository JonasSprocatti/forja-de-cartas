-- ============================================================
-- Forja de Cartas — COLEÇÕES / SETS (incremental)
-- Rode DEPOIS do supabase-schema.sql. Cole no SQL Editor → Run.
-- ============================================================

create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  name        text not null,
  description text,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.collections enable row level security;

drop policy if exists "ler coleções próprias ou públicas" on public.collections;
create policy "ler coleções próprias ou públicas" on public.collections
  for select using (is_public or auth.uid() = user_id);
drop policy if exists "inserir coleções próprias" on public.collections;
create policy "inserir coleções próprias" on public.collections
  for insert with check (auth.uid() = user_id);
drop policy if exists "atualizar coleções próprias" on public.collections;
create policy "atualizar coleções próprias" on public.collections
  for update using (auth.uid() = user_id);
drop policy if exists "apagar coleções próprias" on public.collections;
create policy "apagar coleções próprias" on public.collections
  for delete using (auth.uid() = user_id);

create table if not exists public.collection_cards (
  collection_id uuid not null references public.collections on delete cascade,
  card_id       uuid not null references public.cards on delete cascade,
  qty           int  not null default 1 check (qty between 1 and 99),
  position      int  not null default 0,
  added_at      timestamptz not null default now(),
  primary key (collection_id, card_id)
);
alter table public.collection_cards enable row level security;

drop policy if exists "ler itens de coleção visível" on public.collection_cards;
create policy "ler itens de coleção visível" on public.collection_cards for select using (
  exists (select 1 from public.collections c where c.id = collection_id and (c.is_public or c.user_id = auth.uid()))
);
drop policy if exists "inserir itens na própria coleção" on public.collection_cards;
create policy "inserir itens na própria coleção" on public.collection_cards for insert with check (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
drop policy if exists "atualizar itens na própria coleção" on public.collection_cards;
create policy "atualizar itens na própria coleção" on public.collection_cards for update using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);
drop policy if exists "apagar itens na própria coleção" on public.collection_cards;
create policy "apagar itens na própria coleção" on public.collection_cards for delete using (
  exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
);

create index if not exists colcards_col_idx on public.collection_cards (collection_id, position);

-- Permite ver cartas que estão em uma coleção pública (para o compartilhamento por link).
drop policy if exists "ler cartas próprias ou públicas" on public.cards;
create policy "ler cartas próprias ou públicas" on public.cards for select using (
  is_public
  or auth.uid() = user_id
  or exists (
    select 1 from public.collection_cards cc
    join public.collections c on c.id = cc.collection_id
    where cc.card_id = cards.id and c.is_public
  )
);
