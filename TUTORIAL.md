# 🛠️ Forja de Cartas — Tutorial completo de configuração

Guia do zero ao deploy. Você pode parar em qualquer etapa: o app funciona com o que estiver configurado e simplesmente desliga o que faltar (sem Supabase = sem login/galeria; sem Gemini = sem IA; sem Stripe = sem VIP; sem AdSense = sem anúncios).

---

## 1. O que cada parte faz

| Parte | Para quê | Obrigatório? |
|---|---|---|
| **Frontend** (`index.html`, `app.js`, `style.css`) | Editor de cartas, prévia, export PNG, folha de impressão | Sim (é o app) |
| **Supabase** | Login, salvar cartas, galeria, curtidas/estrelas/comentários, coleções, perfis, moderação | Opcional |
| **Gemini** (`api/generate-*.js`) | Gerar texto e arte por IA | Opcional |
| **Stripe** (`api/*checkout*`, `api/stripe-webhook.js`) | Assinatura VIP | Opcional |
| **AdSense** (`ads.js`) | Anúncios para não‑VIP | Opcional |

---

## 2. Rodar localmente (rápido)

Não precisa de build. Servindo a pasta:

```bash
cd forja-de-cartas
python3 -m http.server 8080
# abra http://localhost:8080
```

Sem `config.js`, a conta aparece como "off" e a IA fica indisponível — mas o editor, a prévia, o export PNG e a folha de impressão funcionam.

> As chamadas de IA, Supabase e Stripe usam funções em `api/`. Localmente elas só respondem se você rodar com o **Vercel CLI** (`vercel dev`) ou com o **servidor Express** (`npm install && npm start`, que usa `server.js`).

---

## 3. Estrutura de arquivos

```
forja-de-cartas/
├─ index.html            # UI principal
├─ app.js                # editor, render dos 11 layouts, export, folha de impressão
├─ account.js            # Supabase: login, galeria, coleções, perfis, moderação
├─ ads.js                # AdSense (não-VIP)
├─ style.css
├─ config.example.js     # copie para config.js e preencha
├─ api/
│  ├─ generate-card.js   # texto por IA (Gemini)
│  ├─ generate-art.js    # arte por IA (Gemini)
│  ├─ create-checkout.js # Stripe Checkout (VIP)
│  └─ stripe-webhook.js  # confirma o pagamento e marca is_vip
├─ server.js             # adaptador Express (para Render); ignorado na Vercel
├─ render.yaml           # blueprint do Render
├─ assets/frames/        # frames próprios (PNG) opcionais
├─ supabase-schema.sql       # 1º
├─ supabase-collections.sql  # 2º
├─ supabase-moderation.sql   # 3º
└─ supabase-profiles.sql     # 4º
```

---

## 4. Supabase (login + comunidade)

### 4.1 Criar o projeto
1. Crie uma conta em **supabase.com** e um projeto novo.
2. Em **Project Settings → API**, anote:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` (pode ficar no front-end)
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (**SECRETO** — só no servidor)

### 4.2 Rodar os SQLs **nesta ordem**
Em **SQL Editor → New query**, cole e rode um de cada vez:
1. `supabase-schema.sql` — base: `profiles`, `cards`, `ratings`, `comments`, a view `card_stats`, RLS e o gatilho que cria o perfil no cadastro.
2. `supabase-collections.sql` — `collections` + `collection_cards` (coleções/sets).
3. `supabase-moderation.sql` — `likes`, `reports`, flags `is_admin`/`blocked`, auto‑ocultação por denúncias.
4. `supabase-profiles.sql` — coluna `bio` no perfil.

> Se rodar fora de ordem dá erro de dependência (ex.: moderação referencia `collection_cards`). Rode do 1 ao 4.

### 4.3 Login por e-mail e Google (OAuth)
- **Authentication → Providers → Email**: já vem ligado. (Em **Email** você pode desativar "Confirm email" para testar mais rápido.)
- **Google**: ligue o provider, crie um **OAuth Client** no Google Cloud Console, e em **Authorized redirect URIs** use a URL que o Supabase mostra (algo como `https://SEU-PROJETO.supabase.co/auth/v1/callback`). Cole Client ID/Secret no Supabase.
- Em **Authentication → URL Configuration**, coloque a URL do seu site em **Site URL** e **Redirect URLs** (ex.: `https://seuapp.vercel.app`).

### 4.4 Criar o `config.js` (frontend)
Copie `config.example.js` para `config.js` e preencha:

```js
window.FORGE_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA_ANON_KEY",
  ADSENSE_CLIENT: "",   // opcional
  ADSENSE_SLOTS: {}     // opcional
};
```

> `config.js` só contém chaves **públicas** (URL e anon do Supabase, client do AdSense). Pode ser servido junto com o site. Está no `.gitignore` por padrão — para o deploy, garanta que ele exista na build (você pode commitá-lo sem problema, ou criá-lo no processo de deploy).

---

## 5. Gemini (IA de texto e arte)

1. Em **aistudio.google.com** gere uma **API key**.
2. Defina no servidor (ver seção 7) a variável **`GEMINI_API_KEY`**.
3. Opcionais (têm padrão): **`GEMINI_MODEL`** (padrão `gemini-2.5-flash`) e **`GEMINI_IMAGE_MODEL`** (padrão `gemini-2.5-flash-image`).

> A mesma `GEMINI_API_KEY` serve para texto e arte. O modelo de imagem usado tem camada gratuita.

---

## 6. Stripe (assinatura VIP)

1. No **Dashboard da Stripe**, crie um **Product** com um **Price** (você define valor, moeda e recorrência aqui). Copie o **Price ID** (`price_...`).
2. Variáveis no servidor:
   - **`STRIPE_SECRET_KEY`** = `sk_...`
   - **`STRIPE_PRICE_ID`** = `price_...`
   - **`STRIPE_MODE`** = `subscription` (assinatura) ou `payment` (pagamento único)
3. **Webhook** (confirma o pagamento e marca o VIP):
   - **Developers → Webhooks → Add endpoint**: `https://SEU-SITE/api/stripe-webhook`
   - Eventos: `checkout.session.completed` (e, para assinatura, `customer.subscription.deleted` se quiser revogar).
   - Copie o **Signing secret** (`whsec_...`) para **`STRIPE_WEBHOOK_SECRET`**.
4. O webhook usa a `SUPABASE_SERVICE_ROLE_KEY` para gravar `is_vip` no perfil — então ela precisa estar no servidor.

> **Gate da IA:** a checagem de VIP no servidor só liga se `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` estiverem definidas. Sem elas, a IA fica **aberta a todos** (útil para testar).

---

## 7. Variáveis de ambiente (servidor)

Defina-as no painel do seu host (Vercel/Render) — **nunca** no `config.js`.

| Variável | Para quê | Obrigatória |
|---|---|---|
| `GEMINI_API_KEY` | IA (texto e arte) | para IA |
| `GEMINI_MODEL` | modelo de texto | não (tem padrão) |
| `GEMINI_IMAGE_MODEL` | modelo de imagem | não (tem padrão) |
| `SUPABASE_URL` | gate de VIP + webhook | para VIP |
| `SUPABASE_ANON_KEY` | validar usuário no servidor | para VIP |
| `SUPABASE_SERVICE_ROLE_KEY` | gravar `is_vip` (webhook) | para VIP |
| `STRIPE_SECRET_KEY` | criar checkout | para VIP |
| `STRIPE_PRICE_ID` | preço do VIP | para VIP |
| `STRIPE_MODE` | `subscription` ou `payment` | para VIP |
| `STRIPE_WEBHOOK_SECRET` | validar webhook | para VIP |

---

## 8. Deploy

### Opção A — Vercel (recomendada, zero-config)
1. Suba o projeto para um repositório (GitHub) **ou** use `vercel` (CLI).
2. Importe na Vercel. Ela detecta a pasta `api/` como funções automaticamente; o resto é estático.
3. Em **Settings → Environment Variables**, adicione as variáveis da seção 7.
4. Garanta que o **`config.js`** exista na build (seção 4.4).
5. Deploy. Pegue a URL e coloque-a no Supabase (seção 4.3) e no webhook da Stripe (seção 6).

### Opção B — Render (com Express)
1. O repositório já tem `server.js` (serve o estático e roteia `/api/*`) e `render.yaml`.
2. Crie um **Web Service** apontando para o repo. Comando de start: `npm start` (Node ≥ 18.17).
3. Adicione as variáveis da seção 7 em **Environment**.
4. O webhook da Stripe precisa do corpo "cru" — a rota de webhook no `server.js` já não usa parser de JSON, então funciona.

> Observação honesta: a Vercel é mais simples (sem o wrapper Express). O plano grátis do Render "dorme" e tem cold start; o webhook da Stripe tolera isso por reenviar.

---

## 9. Pós-deploy

- **Virar admin (moderação):** Supabase → **Table Editor → profiles** → ache sua linha → `is_admin = true`. O botão **⚑ Moderação** aparece no app.
- **Frames próprios (opcional):** coloque seus PNGs em `assets/frames/` e descreva as zonas em `frames.json` (veja `assets/frames/README.md`). O app **não** inclui frames oficiais de terceiros — use arte própria.
- **Definir seu perfil:** botão **☺ Perfil** → nome de usuário (único) + bio. Isso habilita o link público `?u=seunome`.

---

## 10. Teste rápido (sanidade)

1. Abrir o site → criar conta → confirmar que loga.
2. Criar uma carta → **Salvar** → aparece em **Minhas cartas**.
3. **Publicar** → aparece na **Galeria**; testar busca/filtros e curtir.
4. Criar uma **Coleção** (botão ❖ ou via "❖ Coleção" em Minhas cartas) → **Imprimir** a coleção.
5. (Se Stripe) **Virar VIP** → pagar em modo teste → o webhook marca `is_vip` → IA libera.

---

## 11. Problemas comuns

- **"conta off":** falta o `config.js` ou as chaves do Supabase estão erradas.
- **Login Google falha:** confira a *redirect URI* no Google Cloud e as *Redirect URLs* no Supabase.
- **IA não responde:** falta `GEMINI_API_KEY` no servidor (ou você está abrindo o `index.html` por `file://` em vez de servir as funções `api/`).
- **VIP não ativa após pagar:** webhook não chegou — verifique a URL do endpoint, o `STRIPE_WEBHOOK_SECRET` e a `SUPABASE_SERVICE_ROLE_KEY`.
- **Erro ao rodar SQL:** rode os arquivos **na ordem** 1→4 (seção 4.2).
- **Carta pública não aparece para outros:** ela pode ter sido **bloqueada** por denúncias (3+). Veja em ⚑ Moderação.
