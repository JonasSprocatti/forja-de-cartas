-- ============================================================
-- Forja de Cartas — PERFIS (incremental)
-- Adiciona a bio ao perfil. Rode no SQL Editor → Run.
-- (username já existe e é único; profiles já é legível por todos.)
-- ============================================================
alter table public.profiles add column if not exists bio text;
