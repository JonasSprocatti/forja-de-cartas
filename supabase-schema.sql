-- ============================================================
-- Forja de Cartas — schema do Supabase
-- Cole no Supabase: Dashboard → SQL Editor → New query → Run.
-- ============================================================

-- ---------- PERFIS (1 por usuário) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text unique,
  is_vip      boolean not null default false,
  vip_until   timestamptz,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists "perfis visíveis" on public.profiles;
create policy "perfis visíveis" on public.profiles for select using (true);

drop policy if exists "edita o próprio perfil" on public.profiles;
create policy "edita o próprio perfil" on public.profiles for update using (auth.uid() = id);

-- cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute procedure public.handle_new_user();

-- ---------- CARTAS ----------
create table if not exists public.cards (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  name         text,
  layout       text,
  color        text,
  is_public    boolean not null default false,
  data         jsonb not null,                 -- estado completo da carta
  forked_from  uuid references public.cards on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.cards enable row level security;

drop policy if exists "ler cartas próprias ou públicas" on public.cards;
create policy "ler cartas próprias ou públicas" on public.cards
  for select using (is_public or auth.uid() = user_id);

drop policy if exists "inserir cartas próprias" on public.cards;
create policy "inserir cartas próprias" on public.cards
  for insert with check (auth.uid() = user_id);

drop policy if exists "atualizar cartas próprias" on public.cards;
create policy "atualizar cartas próprias" on public.cards
  for update using (auth.uid() = user_id);

drop policy if exists "apagar cartas próprias" on public.cards;
create policy "apagar cartas próprias" on public.cards
  for delete using (auth.uid() = user_id);

create index if not exists cards_user_idx   on public.cards (user_id, updated_at desc);
create index if not exists cards_public_idx on public.cards (is_public, created_at desc);

-- ---------- AVALIAÇÕES (1 a 5 estrelas, 1 por usuário/carta) ----------
create table if not exists public.ratings (
  card_id     uuid not null references public.cards on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  stars       int  not null check (stars between 1 and 5),
  created_at  timestamptz not null default now(),
  primary key (card_id, user_id)
);
alter table public.ratings enable row level security;

drop policy if exists "avaliações visíveis" on public.ratings;
create policy "avaliações visíveis" on public.ratings for select using (true);

drop policy if exists "avaliar como você mesmo" on public.ratings;
create policy "avaliar como você mesmo" on public.ratings for insert with check (auth.uid() = user_id);

drop policy if exists "atualizar a própria avaliação" on public.ratings;
create policy "atualizar a própria avaliação" on public.ratings for update using (auth.uid() = user_id);

drop policy if exists "apagar a própria avaliação" on public.ratings;
create policy "apagar a própria avaliação" on public.ratings for delete using (auth.uid() = user_id);

-- ---------- COMENTÁRIOS ----------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  card_id     uuid not null references public.cards on delete cascade,
  user_id     uuid not null references auth.users on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  created_at  timestamptz not null default now()
);
alter table public.comments enable row level security;

drop policy if exists "comentários visíveis" on public.comments;
create policy "comentários visíveis" on public.comments for select using (true);

drop policy if exists "comentar como você mesmo" on public.comments;
create policy "comentar como você mesmo" on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists "apagar o próprio comentário" on public.comments;
create policy "apagar o próprio comentário" on public.comments for delete using (auth.uid() = user_id);

create index if not exists comments_card_idx on public.comments (card_id, created_at desc);

-- ---------- VISÃO: média de estrelas por carta (para a galeria) ----------
create or replace view public.card_stats as
  select card_id, round(avg(stars)::numeric, 2) as avg_stars, count(*) as votes
  from public.ratings group by card_id;
