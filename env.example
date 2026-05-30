// api/generate-card.js
// Função serverless (Node) — gera os dados de uma carta usando a API da Anthropic.
// Suporta todos os layouts: normal, land, planeswalker, saga, class, battle,
// adventure, token, emblem, dfc, split.
//
// Variáveis de ambiente:
//   ANTHROPIC_API_KEY (obrigatória)
//   ANTHROPIC_MODEL   (opcional — padrão: claude-sonnet-4-6)

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY não configurada no servidor." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt = "", layout = "", color = "" } = body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vazio." });

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

  const colorNames = { W:"branco", U:"azul", B:"preto", R:"vermelho", G:"verde", multi:"multicolor", C:"incolor/artefato" };
  const layoutHint = layout ? `Use OBRIGATORIAMENTE o layout "${layout}".` : "Escolha o layout mais adequado à ideia.";
  const colorHint = color ? `Cor pretendida: ${colorNames[color] || color}.` : "Você escolhe a cor.";

  const system = `Você é um designer de um jogo de cartas colecionáveis de fantasia (estilo genérico; NÃO copie cartas existentes nem use nomes de marcas registradas). Crie uma carta ORIGINAL e equilibrada em PORTUGUÊS do Brasil.

Custo de mana: números para mana genérica e letras W(branco) U(azul) B(preto) R(vermelho) G(verde) C(incolor) X(variável). Ex.: "2WU", "3", "" (vazio para terreno/ficha).

LAYOUTS possíveis (campo "layout"):
- "normal": criatura, instantâneo, feitiço, artefato, encantamento. Use "pt" se for criatura.
- "land": terreno. mana vazio. regras de produção de mana.
- "planeswalker": preencha "loyalty" (lealdade inicial, ex "4") e "pwAbilities": lista de {cost, text} com custos como "+1","−2","0","−7" (use o sinal de menos "−").
- "saga": encantamento. "sagaChapters": lista de {num, text} com num "I","II","III".
- "class": encantamento. "classLevels": lista de {label, cost, text}; o primeiro item é {label:"Base", cost:"", text:...}; os seguintes {label:"Nível 2", cost:"1W", text:...}.
- "battle": "defense" (número, ex "6") e "rules".
- "adventure": criatura com "pt" e "adventure": {name, mana, type:"Instantâneo — Aventura", rules}.
- "token": ficha. mana normalmente vazio; use "pt" se criatura.
- "emblem": só "name" (origem) e "rules".
- "dfc": carta de dupla face; preencha a frente (name, mana, type, rules, flavor, pt) e "back": {name, mana, type, rules, flavor, pt}.
- "split": duas metades; frente nos campos normais e "split": {name, mana, type, rules}.

Responda APENAS com JSON válido, sem markdown, sem crases, com as chaves aplicáveis ao layout:
{
  "layout": "...",
  "name": "...", "mana": "...", "type": "...",
  "rules": "use \\n para quebras; texto de lembrete entre parênteses",
  "flavor": "frase curta entre aspas ou vazio",
  "pt": "ex 3/4 ou vazio",
  "rarity": "comum|incomum|rara|mítica",
  "loyalty": "", "defense": "",
  "pwAbilities": [], "sagaChapters": [], "classLevels": [],
  "adventure": null, "split": null, "back": null,
  "artPrompt": "descrição em INGLÊS para gerar a ilustração, arte de fantasia"
}
Inclua apenas as chaves que fizerem sentido para o layout escolhido.`;

  const userMsg = `Ideia: ${prompt}\n${layoutHint}\n${colorHint}`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 1400, system, messages: [{ role: "user", content: userMsg }] }),
    });
    if (!r.ok) return res.status(502).json({ error: `API da Anthropic retornou ${r.status}.`, detail: await r.text() });

    const data = await r.json();
    let text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("").trim();
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
