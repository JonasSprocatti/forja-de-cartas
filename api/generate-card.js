// api/generate-card.js
// Função serverless (Node) — gera os dados de uma carta usando a API do Google Gemini.
// Suporta todos os layouts: normal, land, planeswalker, saga, class, battle,
// adventure, token, emblem, dfc, split.
//
// Variáveis de ambiente:
//   GEMINI_API_KEY (obrigatória) — chave do Google AI Studio
//   GEMINI_MODEL   (opcional — padrão: gemini-2.5-flash)

// Verifica VIP no servidor. Só atua se SUPABASE_URL estiver configurada (senão, IA aberta).
export const maxDuration = 60; // Permite até 60 segundos de execução
async function ensureVip(req) {
  const base = process.env.SUPABASE_URL;
  if (!base) return { ok: true };
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, code: 401, error: "Faça login para usar a IA." };
  try {
    const ur = await fetch(`${base}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    if (!ur.ok) return { ok: false, code: 401, error: "Sessão inválida." };
    const user = await ur.json();
    if (!user?.id) return { ok: false, code: 401, error: "Sessão inválida." };
    const pr = await fetch(`${base}/rest/v1/profiles?id=eq.${user.id}&select=is_vip`, {
      headers: { apikey: service, Authorization: `Bearer ${service}` },
    });
    const rows = await pr.json().catch(() => []);
    if (!(Array.isArray(rows) && rows[0] && rows[0].is_vip))
      return { ok: false, code: 403, error: "A geração por IA é exclusiva para VIP." };
    return { ok: true };
  } catch (e) {
    return { ok: false, code: 500, error: "Falha ao verificar VIP: " + e.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  const gate = await ensureVip(req);
  if (!gate.ok) return res.status(gate.code).json({ error: gate.error });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY não configurada no servidor." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt = "", layout = "", color = "" } = body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vazio." });

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  const colorNames = { W:"branco", U:"azul", B:"preto", R:"vermelho", G:"verde", multi:"multicolor", C:"incolor/artefato" };
  const layoutHint = layout ? `Use OBRIGATORIAMENTE o layout "${layout}".` : "Escolha o layout mais adequado à ideia.";
  const colorHint = color ? `Cor pretendida: ${colorNames[color] || color}.` : "Você escolhe a cor.";

  const system = `Você é um designer de um jogo de cartas colecionáveis de fantasia (estilo genérico; NÃO copie cartas existentes nem use nomes de marcas registradas). Crie uma carta ORIGINAL e equilibrada em PORTUGUÊS do Brasil.

Custo de mana: números para mana genérica e letras W(branco) U(azul) B(preto) R(vermelho) G(verde) C(incolor) X(variável). Ex.: "2WU", "3", "" (vazio para terreno/ficha).

LAYOUTS possíveis (campo "layout"):
- "normal": criatura, instantâneo, feitiço, artefato, encantamento. Use "pt" se for criatura.
- "land": terreno. mana vazio. regras de produção de mana.
- "planeswalker": preencha "loyalty" (lealdade inicial, ex "4") e "pwAbilities": lista de {cost, text} com custos como "+1","-2","0","-7".
- "saga": encantamento. "sagaChapters": lista de {num, text} com num "I","II","III".
- "class": encantamento. "classLevels": lista de {label, cost, text}; o primeiro item é {label:"Base", cost:"", text:...}; os seguintes {label:"Nível 2", cost:"1W", text:...}.
- "battle": "defense" (número, ex "6") e "rules".
- "adventure": criatura com "pt" e "adventure": {name, mana, type:"Instantâneo — Aventura", rules}.
- "token": ficha. mana normalmente vazio; use "pt" se criatura.
- "emblem": só "name" (origem) e "rules".
- "dfc": carta de dupla face; preencha a frente (name, mana, type, rules, flavor, pt) e "back": {name, mana, type, rules, flavor, pt}.
- "split": duas metades; frente nos campos normais e "split": {name, mana, type, rules}.

Responda com um objeto JSON com as chaves aplicáveis ao layout:
layout, name, mana, type, rules (use \\n para quebras; texto de lembrete entre parênteses), flavor (frase curta entre aspas ou vazio), pt (ex 3/4 ou vazio), rarity (comum|incomum|rara|mítica), loyalty, defense, pwAbilities (lista), sagaChapters (lista), classLevels (lista), adventure (objeto ou null), split (objeto ou null), back (objeto ou null), artPrompt (descrição em INGLÊS para gerar a ilustração, arte de fantasia).
Inclua apenas as chaves que fizerem sentido para o layout escolhido.`;

  const userMsg = `Ideia: ${prompt}\n${layoutHint}\n${colorHint}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: userMsg }] }],
        generationConfig: {
          temperature: 1,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!r.ok) return res.status(502).json({ error: `API do Gemini retornou ${r.status}.`, detail: await r.text() });

    const data = await r.json();

    // bloqueio de segurança / resposta vazia
    const cand = data?.candidates?.[0];
    if (!cand) {
      const fb = data?.promptFeedback?.blockReason;
      return res.status(502).json({ error: fb ? `Pedido bloqueado pelo Gemini (${fb}).` : "Resposta vazia do Gemini." });
    }

    // junta todo o texto das partes (ignora partes de "pensamento")
    let text = (cand.content?.parts || []).filter((p) => typeof p.text === "string" && !p.thought).map((p) => p.text).join("").trim();
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let cardObj;
    try { cardObj = JSON.parse(text); }
    catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (!m) return res.status(502).json({ error: "Não consegui interpretar a resposta da IA." });
      cardObj = JSON.parse(m[0]);
    }
    return res.status(200).json(cardObj);
  } catch (err) {
    return res.status(500).json({ error: "Falha ao chamar a IA: " + err.message });
  }
}
