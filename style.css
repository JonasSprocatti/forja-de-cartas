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
│   ├── generate-card.js    # backend: gera a carta (texto) via Claude
│   └── generate-art.js     # backend: gera a ilustração (OpenAI)
├── package.json
├── .env.example            # modelo das variáveis de ambiente
└── README.md
```

O frontend é estático (HTML/CSS/JS puro, sem build). As funções em `api/` são *serverless* e existem só para **guardar suas chaves de API em segredo** — elas nunca aparecem no navegador.

---

## 🔑 Chaves de API que você vai precisar

| Recurso | Chave | Obrigatória? |
|---|---|---|
| IA monta a carta (texto) | `ANTHROPIC_API_KEY` | Sim, para o modo "Deixar a IA criar" |
| IA gera a ilustração | `OPENAI_API_KEY` | Não — sem ela, é só subir sua imagem |

- **Anthropic (Claude):** crie a chave em `console.anthropic.com` → *API Keys*.
- **OpenAI (imagem):** crie a chave em `platform.openai.com` → *API keys*.

> Sem nenhuma chave, o app ainda funciona 100% no **modo manual + upload de imagem**. As chaves só ligam os recursos de IA. Ambas as APIs são pagas por uso (texto é bem barato; imagem custa mais por geração).

---

## 🚀 Hospedar de graça (passo a passo)

A forma mais simples, porque suporta o site estático **e** as funções serverless do mesmo jeito que o código foi escrito:

### Opção 1 — Vercel (recomendado)

1. Suba esta pasta para um repositório no **GitHub** (ou GitLab/Bitbucket).
2. Crie conta grátis em **vercel.com** e clique em **Add New → Project**.
3. Selecione o repositório. A Vercel detecta tudo sozinha (não precisa configurar build).
4. Em **Settings → Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave
   - `OPENAI_API_KEY` = sua chave (opcional)
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

- **Layout:** escolha o tipo de carta no topo do painel — os campos se adaptam (planeswalker mostra habilidades de lealdade, saga mostra capítulos, etc.).
- **Custo de mana:** números = mana genérica; letras = mana colorida. `W` branco, `U` azul, `B` preto, `R` vermelho, `G` verde, `C` incolor, `X` variável. Ex.: `2WU`.
- **Texto de regras:** o que estiver entre `(parênteses)` vira *texto de lembrete* em itálico automaticamente.
- **Listas (planeswalker/saga/classe):** use **+ habilidade / + capítulo / + nível** para adicionar linhas e o **✕** para remover.
- **Dupla face:** preencha a frente nos campos principais e o verso no bloco "Verso"; o botão **⟲ Virar carta** alterna a prévia. O export gera um PNG por face.
- **Cor do frame:** "automático" deduz pelo custo de mana, ou force uma cor.
- Botão **⟳ Exemplo** carrega cartas de teste de vários layouts.

---

## 🔧 Personalizar

- **Trocar o modelo da Anthropic:** variável `ANTHROPIC_MODEL` (padrão `claude-sonnet-4-6`; para mais barato/rápido, um modelo Haiku).
- **Trocar o modelo de imagem:** variável `OPENAI_IMAGE_MODEL` (padrão `gpt-image-1`).
- **Cores do frame:** edite os blocos `.card[data-color="..."]` no `style.css`.
- **Layout do frame:** tudo está em `style.css`, na seção "A CARTA".

Divirta-se forjando. 🗡️
