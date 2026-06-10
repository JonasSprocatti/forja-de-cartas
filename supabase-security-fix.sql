-- ============================================================
-- Forja de Cartas — CORREÇÃO DE SEGURANÇA (CRÍTICA)
-- Rode no Supabase: SQL Editor → cole tudo → Run.
--
-- PROBLEMA: a policy de UPDATE de "profiles" não restringe colunas.
-- Como a anon key vai para o navegador, qualquer usuário logado podia
-- rodar no console:
--   supabase.from('profiles').update({ is_vip:true, is_admin:true }).eq('id', SEU_ID)
-- e virar VIP/admin de graça, furando a Stripe e a checagem de VIP do servidor.
--
-- SOLUÇÃO: privilégios por COLUNA. O usuário só pode editar username/bio.
-- is_vip / is_admin / vip_until passam a ser graváveis apenas pelo service_role
-- (usado pelo webhook da Stripe, que ignora RLS).
-- ============================================================

-- 1) remove o UPDATE amplo dos papéis públicos
revoke update on public.profiles from anon, authenticated;

-- 2) devolve só as colunas que o próprio usuário pode alterar
grant update (username) on public.profiles to authenticated;

-- só rode a linha abaixo se a coluna "bio" já existe (migração de perfis):
grant update (bio) on public.profiles to authenticated;

-- A policy "edita o próprio perfil" (auth.uid() = id) continua valendo;
-- agora ela só consegue afetar username/bio. O webhook (service_role) segue
-- conseguindo definir is_vip normalmente.

-- ----- VERIFICAÇÃO (opcional) -----
-- Logado como um usuário comum, isto deve FALHAR com "permission denied":
--   update public.profiles set is_vip = true where id = auth.uid();
