# 🔥 Forja de Cartas

App web para criar cartas de batalha em estilo fantasia, **cobrindo todos os layouts**. Você pode **preencher os campos manualmente** ou **descrever a ideia e deixar a IA montar a carta inteira** (ela escolhe o layout). A ilustração pode ser **gerada por IA** ou ser uma **imagem sua**. No fim, **exporta em PNG**.

### Tipos / layouts suportados

| Layout | O que muda |
|---|---|
| **Padrão** | Criatura, instantâneo, feitiço, artefato, encantamento (e supertipos como Lendário/Neve, ou Tribal/Kindred — basta digitar na linha de tipo) |
| **Terreno** | Sem custo de mana |
| **Planeswalker** | Lealdade inicial + lista de habilidades (+1 / −2 / −7…) |
| **Saga** | Capítulos (I, II, III) com arte na lateral |
| **Classe** | Níveis com custo de subida |
| **Batalha (Siege)** | Carta em paisagem + valor de defesa |
| **Aventura** | Criatura com uma mágica-aventura embutida |
| **Ficha (Token)** | Sem custo, arte maior |
| **Emblema** | Cartão escuro só com texto |
| **Dupla face (transformar)** | Frente + verso, com botão para virar |
| **Dividida (Split)** | Duas metades em paisagem |

> A maioria dos *tipos* do Magic (Criatura, Encantamento, Artefato, supertipos…) é apenas texto na **linha de tipo** — então o layout "Padrão" já cobre todos eles. Os layouts acima existem porque mudam a **estrutura** da carta.

> ⚠️ **Aviso:** o frame, os "pips" de mana e o layout aqui são **originais**, apenas *inspirados* no formato. O projeto **não usa** as artes, fontes, símbolos ou marcas oficiais da Wizards of the Coast / Magic: The Gathering. Use para criações próprias (homebrew), não para reproduzir cartas existentes ou para fins comerciais com a marca.

---

## 📁 O que tem aqui

```
card-forge/
├── index.html              # interface
├── style.css               # estilo + frame da carta
├── app.js                  # lógica: prévia ao vivo, mana, IA, export PNG
├── api/
│   ├── generate-card.js    # backend: gera a carta (texto) via Gemini
│   └── generate-art.js     # backend: gera a ilustração (Gemini)
├── package.json
├── .env.example            # modelo das variáveis de ambiente
└── README.md
```

O frontend é estático (HTML/CSS/JS puro, sem build). As funções em `api/` são *serverless* e existem só para **guardar suas chaves de API em segredo** — elas nunca aparecem no navegador.

---

## 🔑 Chaves de API que você vai precisar

| Recurso | Chave | Obrigatória? |
|---|---|---|
| IA monta a carta (texto) | `GEMINI_API_KEY` | Sim, para o modo "Deixar a IA criar" |
| IA gera a ilustração | `GEMINI_API_KEY` (a mesma) | Não — sem ela, é só subir sua imagem |

- **Google Gemini:** crie a chave em `aistudio.google.com/apikey`.
- A **mesma chave do Gemini** (`GEMINI_API_KEY`) também gera a arte — não precisa de outra conta.

> Sem nenhuma chave, o app ainda funciona 100% no **modo manual + upload de imagem**. As chaves só ligam os recursos de IA. Ambas as APIs são pagas por uso (texto é bem barato; imagem custa mais por geração).

---

## 🚀 Hospedar de graça (passo a passo)

A forma mais simples, porque suporta o site estático **e** as funções serverless do mesmo jeito que o código foi escrito:

### Opção 1 — Vercel (recomendado)

1. Suba esta pasta para um repositório no **GitHub** (ou GitLab/Bitbucket).
2. Crie conta grátis em **vercel.com** e clique em **Add New → Project**.
3. Selecione o repositório. A Vercel detecta tudo sozinha (não precisa configurar build).
4. Em **Settings → Environment Variables**, adicione:
   - `GEMINI_API_KEY` = sua chave
   - _(a arte usa a mesma `GEMINI_API_KEY`; nada a mais para configurar)_
5. **Deploy**. Pronto — você recebe uma URL pública `https://seu-app.vercel.app`.

Para rodar local antes: `npm i -g vercel` → `vercel dev` (ele lê um arquivo `.env` na raiz; copie o `.env.example` para `.env` e preencha).

### Opção 2 — Netlify

Funciona, mas as funções têm assinatura um pouco diferente. Mova os arquivos de `api/` para `netlify/functions/` e troque o cabeçalho de cada função de
`export default async function handler(req, res)` para o formato Netlify
`export default async (req, context) => { ... return new Response(JSON.stringify(...)) }`.
Depois configure as variáveis em **Site settings → Environment variables**. (A Vercel evita esse retrabalho.)

### Opção 3 — Cloudflare Pages

Hospeda o estático de graça e tem *Functions* (Workers). Mesma ideia da Netlify: as funções precisam ser adaptadas para o formato Workers (`export async function onRequestPost(context)`).

### Opção 4 — Render

`render.com` tem plano grátis para *Web Services* Node. Dá pra servir o estático e as rotas `api/` com um pequeno servidor Express, se preferir um único serviço.

> **Atenção ao GitHub Pages:** ele só serve arquivos estáticos e **não roda funções serverless**. Lá o app funciona apenas no modo **manual + upload** — os botões de IA não vão responder.

---

## 🧪 Rodando localmente

```bash
# 1. copie o modelo de variáveis
cp .env.example .env
# 2. edite o .env e cole suas chaves
# 3. rode (precisa do Vercel CLI):
npm i -g vercel
vercel dev
```

Abra `http://localhost:3000`.

> Só quer testar o visual sem IA? Pode abrir o `index.html` direto no navegador — a prévia, o upload de imagem e o export PNG funcionam offline. Os botões de IA precisam do servidor (`vercel dev`).

---

## ✍️ Como usar

- **Estilo do frame** (para os frames embutidos): **Moderno**, **Full-art** (borderless — arte de borda a borda com o texto sobre faixas translúcidas) e **Retrô** (anos 90).
- **Foil:** botão de acabamento holográfico animado (funciona em qualquer frame, embutido ou da pasta).
- **Sobreposições (PNG por cima):** adicione PNGs (de preferência com transparência) para dar profundidade. Cada um tem **camada** (*Frente*, acima de tudo, ou *Atrás do texto*, acima da arte e abaixo das informações), **ordem** na pilha (subir/descer) e sliders de posição (X/Y), tamanho (L/A) e opacidade. Saem no PNG exportado e são salvos com a carta.
- **Layout:** escolha o tipo de carta no topo do painel — os campos se adaptam (planeswalker mostra habilidades de lealdade, saga mostra capítulos, etc.).
- **Importar carta real (Scryfall):** digite o nome e clique em *Buscar*. Puxa nome, custo, tipo, regras, P/R, raridade e detecta o layout (saga, planeswalker, batalha, dupla face, dividida). Os dados vêm **em inglês** e a **arte não é importada** (a ilustração é do artista) — use a sua imagem.
- **Símbolos no texto:** use a notação entre chaves e eles viram pips: `{T}` virar, `{W} {U} {B} {R} {G}` cores, `{2}` genérico, `{X}`, `{C}` incolor, `{S}` neve, `{E}` energia, `{W/U}` híbrido, `{W/P}` phyrexiano.
- **Custo de mana:** números = mana genérica; letras = colorida. Aceita `2WU` ou `{2}{W}{U}`.
- **Listas (planeswalker/saga/classe):** use **+ habilidade / + capítulo / + nível** e o **✕** para remover.
- **Dupla face:** frente nos campos principais, verso no bloco "Verso"; **⟲ Virar carta** alterna a prévia. O export gera um PNG por face.
- **Cor do frame:** "automático" deduz pelo custo, ou force uma cor.
- Botão **⟳ Exemplo** carrega cartas de teste de vários layouts.

### Frames personalizados (seus próprios)

Dá pra usar **frames que você mesmo fizer**, sem mexer no código: jogue o PNG em `assets/frames/`, registre no `assets/frames/frames.json` dizendo onde ficam a arte, o nome, o texto etc., e ele aparece no seletor **"Frame"** do app. Já vem um frame de exemplo (`classic-bronze`, original) para você usar de molde. O passo a passo completo está em **`assets/frames/README.md`**.

Regras rápidas: PNG na proporção da carta (960×1344 recomendado), com a **janela de arte transparente** (a ilustração fica atrás e aparece por ela); coordenadas em **%** no JSON. Os frames da pasta só carregam com o site **servido** (Vercel/servidor local), não por `file://`.

Quando um frame da pasta está selecionado, aparece o **⚙ Ajustar zonas do frame**: sliders para mover/redimensionar cada zona ao vivo, com **⎘ Copiar JSON** (gera o bloco pronto pra colar no `frames.json`) e **↺ Restaurar**. Os frames da pasta também já renderizam o conteúdo de **planeswalker, saga e classe** na zona de texto (adicione uma zona `loyalty` ou `defense` no JSON quando precisar).

### Sobre frames, fontes e símbolos "oficiais"

Este app usa **frame, pips e tipografia originais** (fontes livres Cinzel + EB Garamond), apenas *inspirados* no formato. Ele **não embute** os frames de alta resolução (Card Conjurer/MSE/mpcproxies), os escudos de coleção, nem as fontes licenciadas (Beleren, MPlantin, Matrix). Isso é intencional: esses são assets protegidos da Wizards, e sites que os hospedam costumam sofrer takedown (foi o que tirou o Card Conjurer do ar). Servir esses arquivos num site público te expõe ao mesmo risco — então a Forja fica do lado seguro.

O que dá pra usar com tranquilidade:
- **Dados** via Scryfall (`/cards/named`, `/symbology`, `/sets`) e **MTGJSON** — são fontes de informação, não de arte.
- **Fontes livres** que evocam o visual (já incluídas). Se quiser aproximar mais: *Cinzel* (display) ≈ Beleren; *Libre Baskerville* ou *PT Serif* ≈ MPlantin para a caixa de regras.
- Sua **própria arte** (upload) ou arte gerada por IA.

---

## 🔧 Personalizar

- **Trocar o modelo do Gemini:** variável `GEMINI_MODEL` (padrão `gemini-2.5-flash`; ex.: `gemini-2.5-pro` para mais qualidade, ou um modelo 3.x se disponível).
- **Trocar o modelo de imagem:** variável `GEMINI_IMAGE_MODEL` (padrão `gemini-2.5-flash-image`, com nível gratuito).
- **Cores do frame:** edite os blocos `.card[data-color="..."]` no `style.css`.
- **Layout do frame:** tudo está em `style.css`, na seção "A CARTA".

Divirta-se forjando. 🗡️

## 👤 Contas, cartas, galeria e VIP (Supabase) — Etapas 1 e 2

Login (e-mail + Google), salvar cartas, "minhas cartas", carregar, duplicar/remixar e o **bloqueio da IA para VIP** (validado no servidor). **Galeria pública** com **avaliações (estrelas)** e **comentários** já incluídas. Pagamento (Stripe) e anúncios (AdSense) vêm nas próximas etapas.

### 1. Crie o projeto no Supabase
1. Em `supabase.com`, crie um projeto.
2. **SQL Editor → New query** → cole o conteúdo de **`supabase-schema.sql`** → **Run**. Isso cria perfis, cartas, avaliações e comentários com as permissões (RLS).

### 2. Login com Google
No Supabase: **Authentication → Providers → Google** → ative e cole o *Client ID/Secret* (criados no Google Cloud Console, OAuth). Em **Authentication → URL Configuration**, coloque a URL do seu site (ex.: `https://seu-app.vercel.app`) em *Site URL* e *Redirect URLs*.

### 3. Ligue o login no front-end
Copie `config.example.js` para **`config.js`** e preencha com **Project URL** e **anon key** (em *Settings → API*). São chaves públicas, pode versionar se quiser (já está no `.gitignore` por padrão).

### 4. Ligue o bloqueio VIP (no servidor / Vercel)
Em **Settings → Environment Variables** do Vercel, adicione:
- `SUPABASE_URL` = Project URL
- `SUPABASE_ANON_KEY` = anon key
- `SUPABASE_SERVICE_ROLE_KEY` = service_role key (**secreta — só no servidor**)

Com essas variáveis, as funções de IA passam a **exigir login + conta VIP**. Sem elas, a IA continua aberta (como antes). Redeploy após configurar.

### Como alguém vira VIP (por enquanto, manual)
Até a Etapa 3 (Stripe), marque manualmente: Supabase → **Table Editor → profiles** → coloque `is_vip = true` na linha do usuário. Na Etapa 3 isso passa a ser automático após o pagamento.

> Observação: não consegui testar as chamadas ao Supabase no meu ambiente (sem rede). O código segue a API documentada; se aparecer erro no deploy, me mande a mensagem que eu ajusto.

## 💳 Pagamento VIP (Stripe) — Etapa 3

Botão **Virar VIP** → Stripe Checkout (página segura da Stripe) → webhook marca `is_vip=true` sozinho. **Você não toca em dados de cartão.** O valor/moeda/recorrência são definidos por você na Stripe.

### 1. Crie o preço na Stripe
Painel da Stripe → **Products** → crie um produto e um **Price** com o valor e a moeda que quiser (ex.: R$ 4,90). Escolha **recorrente** (assinatura) ou **único**. Copie o `price_...`.

### 2. Variáveis no Vercel (Settings → Environment Variables)
- `STRIPE_SECRET_KEY` = sua chave secreta (`sk_live_...` ou `sk_test_...`)
- `STRIPE_PRICE_ID` = o `price_...` criado
- `STRIPE_MODE` = `subscription` (recorrente) ou `payment` (único)
- `STRIPE_WEBHOOK_SECRET` = (passo 3)

### 3. Webhook
Stripe → **Developers → Webhooks → Add endpoint**:
- URL: `https://SEU-APP.vercel.app/api/stripe-webhook`
- Eventos: `checkout.session.completed` e (se assinatura) `customer.subscription.deleted`
- Copie o **Signing secret** (`whsec_...`) para `STRIPE_WEBHOOK_SECRET` e faça **redeploy**.

### Como funciona
- Usuário logado clica **Virar VIP** → vai pro Checkout → paga → volta pro site (`?vip=success`).
- A Stripe chama o webhook, que escreve `is_vip=true` no perfil. Em segundos o app reconhece e o VIP fica ativo (a IA destrava).
- Em assinatura, se cancelar, o evento `customer.subscription.deleted` tira o VIP.

> Teste com as chaves de **teste** da Stripe e os cartões de teste (ex.: `4242 4242 4242 4242`) antes de ir pro modo live. Cobrar de verdade envolve responsabilidades suas (impostos, termos, reembolso) — fora do código.
> Não testei contra a Stripe no meu ambiente; o código segue a API REST e o esquema de assinatura de webhook documentados. Erros no deploy, me manda o log.

## 📢 Anúncios (Google AdSense) — Etapa 4

Anúncios aparecem para visitantes **não‑VIP** e somem para **VIP**. Carregam só depois que o app sabe que a pessoa não é VIP (não "pisca" anúncio pra quem pagou). Sem configurar, nada do Google é carregado.

### Pré-requisito
Conta no **Google AdSense** com o **site aprovado** (a aprovação é do Google e leva um tempo; o site precisa estar no ar com conteúdo). Você recebe um **client** `ca-pub-XXXXXXXXXXXXXXXX` e cria **blocos de anúncio** (cada um tem um *slot id*).

### Configurar
1. Em **`config.js`**, preencha:
   - `ADSENSE_CLIENT`: `"ca-pub-XXXXXXXXXXXXXXXX"`
   - `ADSENSE_SLOTS`: mapa de contêiner → slot. Contêineres disponíveis: `adTop` (abaixo do cabeçalho), `adBottom` (rodapé), `adPanel` (se você adicionar). Ex.:
     ```js
     ADSENSE_SLOTS: { "adTop": "1234567890", "adBottom": "0987654321" }
     ```
2. Edite **`ads.txt`** (na raiz) com o seu ID de editor:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
   (é o mesmo número do client, sem o "ca-"). O AdSense exige esse arquivo em `https://SEU-SITE/ads.txt`.
3. Deploy. Os anúncios aparecem para não‑VIP; VIP não vê.

### Importante
- **Aprovação e políticas** são com o Google: conteúdo elegível, não clicar nos próprios anúncios, etc.
- **Consentimento (LGPD/GDPR):** dependendo do público, o AdSense exige um aviso/CMP de consentimento de cookies. Isso é responsabilidade sua e não está incluído aqui — dá pra adicionar um CMP depois.
- Para adicionar mais espaços, crie um `<div id="adXxx" class="ad-slot" hidden></div>` no `index.html`, inclua o id na lista `CONTAINERS` do `ads.js` e mapeie em `ADSENSE_SLOTS`.

---

🎉 Com isso fecham as 4 etapas do app completo: **contas + cartas + galeria/social + VIP pago + anúncios**.

## 🖨 Folha de impressão (proxies)

Botão **🖨 Folha** no topo. Monte uma fila de cartas (cada uma com quantidade), escolha o papel (A4/Carta) e gere uma **folha com 9 cartas por página no tamanho real (63×88 mm) com linhas de corte**. Abre numa aba pronta pra impressão — no diálogo, escolha **Salvar como PDF**, margens **Padrão** e escala **100%** pra sair no tamanho certo.

- Cada item da fila é um *instantâneo* da carta no momento em que foi adicionada (editar a carta depois não altera o que já está na fila).
- As cartas são renderizadas pelo mesmo motor da prévia, então saem com frame, foil, sobreposições, etc.
- Cartas em paisagem (batalha/dividida) entram na grade retrato e podem ser cortadas nas bordas — o ideal é usá-la com cartas em retrato.

## ❖ Coleções / Sets

Agrupe cartas em coleções (decks/sets), com quantidade por carta, e abra/imprima/compartilhe o conjunto inteiro. Requer login (Supabase).

### Ativar
Rode **`supabase-collections.sql`** no SQL Editor do Supabase (depois do `supabase-schema.sql`). Ele cria as tabelas `collections` e `collection_cards` e ajusta a leitura para permitir ver cartas de coleções públicas (compartilhamento por link).

### Como usar
- Botão **❖ Coleções** (logado) → criar coleção, abrir, **Publicar/Tornar privada**, **Excluir**.
- Dentro de uma coleção: **＋ Adicionar cartas** (escolhe entre as suas cartas salvas), ajustar **quantidade** por carta, **remover**, clicar numa carta para **abrir no editor**.
- **🖨 Imprimir** manda a coleção inteira (com as quantidades) para a folha de impressão.
- Coleção **pública** ganha **🔗 Copiar link** (`...?col=ID`); quem abrir o link vê a coleção em modo leitura, mesmo sem conta.

## ♥ Curtidas e ⚑ Denúncias (moderação)

Rode **`supabase-moderation.sql`** no SQL Editor (depois dos outros). Cria `likes`, `reports`, o flag `is_admin` (em profiles) e `blocked` (em cards), com auto-ocultação.

- **Curtidas:** na galeria (grade e detalhe) há um ♥ com contagem. Curtir/descurtir exige login. A galeria pode ser ordenada por **Mais recentes / Mais curtidas / Melhor avaliadas**.
- **Denúncia:** botão **⚑ Denunciar** no detalhe da carta (com motivo). Uma carta com **3 denunciantes distintos** é **bloqueada automaticamente** e some da galeria/links.
- **Moderação (admin):** marque `is_admin = true` no seu perfil (Table Editor → profiles). Aí aparece o botão **⚑ Moderação**, que lista as cartas denunciadas com prévia, motivos e ações **Ver / Desbloquear / Bloquear / Excluir**.

> A avaliação por estrelas (1–5) continua existindo no detalhe; as curtidas são um voto rápido separado.

## 🔎 Busca/filtros na galeria + 👤 Perfis

Rode **`supabase-profiles.sql`** (adiciona a coluna `bio` ao perfil).

**Busca e filtros (galeria):** barra com **busca por nome**, e filtros por **tipo** (layout), **raridade** e **cor** — além da **ordenação** (recentes / mais curtidas / melhor avaliadas). Nome, tipo e raridade são filtrados no servidor; a cor usa a *cor efetiva* da carta (resolve "automático" pelo custo), filtrada no cliente.

**Perfis:**
- Clique no **nome do autor** (na galeria ou no detalhe) para abrir o **perfil público**: nome, bio, contagem de cartas públicas, total de ♥ e a grade das cartas públicas daquele usuário.
- **🔗 Link** copia um endereço compartilhável `...?u=nomedeusuario` (abre o perfil mesmo sem conta).
- Botão **☺ Perfil** (logado) edita seu **nome de usuário** e **bio**. Nome é único — se já estiver em uso, avisa.

### Atalho: adicionar à coleção de "Minhas cartas"
Cada carta em **Minhas cartas** tem agora **❖ Coleção** — escolha uma coleção existente ou crie uma nova ali mesmo, sem precisar abrir a coleção primeiro. Veja o **TUTORIAL.md** para o passo a passo completo de configuração.

### Galeria com destaques (página inicial da comunidade)
Ao abrir a **✦ Galeria** (sem busca/filtro ativo), aparece uma seção de **Destaques**: **✨ Últimas cartas** (10 mais recentes) e **🏆 Mais votadas** com alternância **Semana / Mês / Ano** (conta as curtidas recebidas no período). Ao buscar/filtrar, os destaques somem e aparece só o resultado. Os botões de comunidade (Galeria, Entrar, etc.) só aparecem quando o Supabase está configurado no `config.js` — sem isso, o topo mostra "conta off".
