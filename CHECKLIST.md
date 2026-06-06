# ✅ Checklist de configuração — Forja de Cartas (Render)

Marque conforme for fazendo. Itens com **(opcional)** só importam para o recurso citado.

---

## 0. Contas que você vai precisar
- [ ] **GitHub** (para hospedar o código e conectar ao Render)
- [ ] **Render** — render.com
- [ ] **Google AI Studio** (Gemini) — IA de texto e arte → `aistudio.google.com/apikey`
- [ ] **Supabase** — login + banco → supabase.com  *(opcional, mas necessário p/ contas/galeria/VIP)*
- [ ] **Stripe** — pagamento VIP → stripe.com  *(opcional)*
- [ ] **Google AdSense** — anúncios → adsense.com  *(opcional, exige aprovação)*

---

## 1. Subir o código
- [ ] Suba esta pasta para um repositório no **GitHub**.
- [ ] Crie o arquivo **`config.js`** (copie de `config.example.js`) e preencha as chaves **públicas** (Supabase URL/anon e, se usar, AdSense). Esse arquivo vai junto no deploy.

## 2. Deploy no Render
**Opção A (recomendada): Blueprint** — já vem o `render.yaml`.
- [ ] Render → **New → Blueprint** → conecte o repositório → ele lê o `render.yaml` e cria o **Web Service**.

**Opção B: manual**
- [ ] Render → **New → Web Service** → conecte o repo.
- [ ] **Runtime:** Node · **Build:** `npm install` · **Start:** `node server.js`.
- [ ] **Plan:** Free (dorme após inatividade) ou Starter (sempre ligado).

- [ ] Anote a URL pública (ex.: `https://forja-de-cartas.onrender.com`).

## 3. Variáveis de ambiente (Render → Environment)
**IA (obrigatória para os botões de IA):**
- [ ] `GEMINI_API_KEY` = sua chave do Google AI Studio
- [ ] `GEMINI_MODEL` = `gemini-2.5-flash` *(opcional)*
- [ ] `GEMINI_IMAGE_MODEL` = `gemini-2.5-flash-image` *(opcional)*

**Login + VIP (Supabase) — opcional, mas liga o "só VIP usa IA":**
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`  *(secreta — só no servidor)*

**Pagamento (Stripe) — opcional:**
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PRICE_ID`
- [ ] `STRIPE_MODE` = `subscription` ou `payment`
- [ ] `STRIPE_WEBHOOK_SECRET`

> Toda vez que mudar uma variável no Render, faça um **Manual Deploy → Deploy latest commit** (ou Save, que já redeploy).

## 4. Supabase *(opcional)*
- [ ] Criar projeto no Supabase.
- [ ] **SQL Editor** → colar `supabase-schema.sql` → **Run**.
- [ ] **Authentication → Providers → Google**: ativar e colar Client ID/Secret (criados no Google Cloud Console).
- [ ] **Authentication → URL Configuration**: *Site URL* e *Redirect URLs* = sua URL do Render.
- [ ] Pegar **Project URL** e **anon key** (Settings → API) e pôr no `config.js`.
- [ ] Pegar **service_role key** (Settings → API) e pôr na variável `SUPABASE_SERVICE_ROLE_KEY` do Render.

## 5. Stripe *(opcional)*
- [ ] **Products** → criar um **Price** (valor, moeda, recorrente ou único) → copiar `price_...` para `STRIPE_PRICE_ID`.
- [ ] Pegar `STRIPE_SECRET_KEY` (use **test** primeiro).
- [ ] **Developers → Webhooks → Add endpoint**:
  - URL: `https://SUA-URL.onrender.com/api/stripe-webhook`
  - Eventos: `checkout.session.completed` (+ `customer.subscription.deleted` se assinatura)
  - Copiar o **Signing secret** (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.
- [ ] Testar com cartão `4242 4242 4242 4242` antes do modo **live**.

## 6. AdSense *(opcional)*
- [ ] Conta AdSense com o **site aprovado** (aprovação é do Google).
- [ ] No `config.js`: `ADSENSE_CLIENT` (`ca-pub-…`) e `ADSENSE_SLOTS` (mapa contêiner→slot).
- [ ] Editar **`ads.txt`** na raiz com o seu `pub-…`.
- [ ] *(se o público for BR/UE)* providenciar aviso de consentimento de cookies (LGPD/GDPR) — não incluso.

---

## 7. Teste final
- [ ] Site abre e cria/edita cartas, exporta PNG.
- [ ] **Importar carta real** (Scryfall) funciona — não precisa de chave.
- [ ] Login (e‑mail e Google), salvar, **Minhas cartas**, galeria, avaliar, comentar.
- [ ] **Virar VIP** abre o Checkout; após pagar (teste), o VIP ativa e a IA destrava.
- [ ] IA de **carta** e **arte** funcionando para VIP; bloqueada para não‑VIP.
- [ ] Anúncios aparecem para não‑VIP e somem para VIP.

> Sem configurar Supabase/Stripe/AdSense, o app funciona em modo aberto: criar cartas, importar do Scryfall, subir imagem, frames, export — e a IA fica liberada (sem exigir VIP) enquanto o Supabase não estiver ligado no servidor.

## Mínimo para colocar no ar
Só quer o criador no ar rápido? Faça **1, 2 e 3 (só `GEMINI_API_KEY`)**. O resto é incremental.
