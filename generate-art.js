// api/generate-art.js
// Função serverless (Node) — gera a ilustração da carta usando a API do Google Gemini.
//
// Controle de CUSTO (tudo no servidor, à prova de burla pelo navegador):
//   - exige VIP;
//   - lê os limites em public.app_settings (editáveis pelo Admin):
//       ai_art_enabled       -> liga/desliga a geração de arte por IA
//       ai_art_bulk_enabled  -> permite (ou não) a geração vinda da planilha (source="bulk")
//       ai_art_daily_limit   -> nº máximo de artes por usuário a cada 24h
//   - conta o uso em public.ai_art_usage (24h) e registra cada geração.
//
// Variáveis de ambiente:
//   GEMINI_API_KEY      (obrigatória)
//   GEMINI_IMAGE_MODEL  (opcional — padrão gemini-2.5-flash-image)
//   GEMINI_ART_ASPECT   (opcional — proporção padrão, ex.: "3:2")
//   SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY

const DEFAULTS = { ai_art_enabled: true, ai_art_bulk_enabled: false, ai_art_daily_limit: 3 };

async function gate(req, source) {
  const base = process.env.SUPABASE_URL;
  if (!base) return { ok: true, base: null }; // sem Supabase (modo dev): não trava
  const anon = process.env.SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = req.headers.authorization || req.headers.Authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, code: 401, error: "Faça login para usar a IA." };

  const svc = { apikey: service, Authorization: `Bearer ${service}` };
  try {
    // 1) usuário válido
    const ur = await fetch(`${base}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
    if (!ur.ok) return { ok: false, code: 401, error: "Sessão inválida." };
    const user = await ur.json();
    if (!user?.id) return { ok: false, code: 401, error: "Sessão inválida." };

    // 2) precisa ser VIP
    const pr = await fetch(`${base}/rest/v1/profiles?id=eq.${user.id}&select=is_vip`, { headers: svc });
    const prof = (await pr.json().catch(() => []))[0];
    if (!prof || !prof.is_vip) return { ok: false, code: 403, error: "A geração por IA é exclusiva para VIP." };

    // 3) configurações (limites controlados pelo Admin)
    const sr = await fetch(`${base}/rest/v1/app_settings?id=eq.1&select=ai_art_enabled,ai_art_bulk_enabled,ai_art_daily_limit`, { headers: svc });
    const st = (await sr.json().catch(() => []))[0] || DEFAULTS;
    if (!st.ai_art_enabled) return { ok: false, code: 403, error: "A geração de arte por IA está temporariamente desativada pelo administrador." };
    if (source === "bulk" && !st.ai_art_bulk_enabled) return { ok: false, code: 403, error: "A geração de arte por IA na importação de planilha está desativada no momento." };

    // 4) limite diário por usuário (conta as últimas 24h em ai_art_usage)
    const limit = Number.isFinite(st.ai_art_daily_limit) ? st.ai_art_daily_limit : DEFAULTS.ai_art_daily_limit;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const cr = await fetch(`${base}/rest/v1/ai_art_usage?user_id=eq.${user.id}&created_at=gte.${encodeURIComponent(since)}&select=id`, {
      headers: Object.assign({ Prefer: "count=exact" }, svc),
    });
    let used = 0;
    const range = cr.headers.get("content-range"); // ex.: "0-2/3" ou "*/0"
    if (range && range.includes("/")) used = parseInt(range.split("/")[1], 10) || 0;
    if (used >= limit) {
      return { ok: false, code: 429, error: `Limite diário de arte por IA atingido (${used}/${limit} nas últimas 24h). Tente novamente mais tarde.` };
    }

    return { ok: true, base, svc, userId: user.id, used, limit };
  } catch (e) {
    return { ok: false, code: 500, error: "Falha ao validar acesso à IA: " + e.message };
  }
}

async function logArtUsage(base, svc, userId, source) {
  if (!base || !userId) return;
  try {
    await fetch(`${base}/rest/v1/ai_art_usage`, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, svc),
      body: JSON.stringify({ user_id: userId, source: source || null }),
    });
  } catch (_) { /* não bloqueia a resposta se o log falhar */ }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt = "", aspect = "", source = "" } = body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vazio." });

  const access = await gate(req, source);
  if (!access.ok) return res.status(access.code).json({ error: access.error });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY não configurada. Configure no servidor ou suba sua própria imagem." });
  }

  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

  // proporção/tamanho da arte parametrizados no código (não precisa vir na descrição da carta).
  const ratio = /^\d{1,2}:\d{1,2}$/.test(aspect) ? aspect : (process.env.GEMINI_ART_ASPECT || "3:2");
  const [aw, ah] = ratio.split(":").map(Number);
  const orient = aw > ah ? "wide landscape" : (aw < ah ? "tall portrait" : "square");

  const fullPrompt = `Fantasy trading card illustration, original artwork. No logos, no text, no watermarks, no copyrighted characters. ${prompt}. Framing: ${orient} composition with a ${ratio} aspect ratio; the illustration must be full-bleed and completely fill the image from edge to edge, with no borders, no margins, no white space and no frame around it. Dramatic lighting, painterly digital art, cinematic composition.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });

    if (!r.ok) return res.status(502).json({ error: `API do Gemini retornou ${r.status}.`, detail: await r.text() });

    const data = await r.json();
    const cand = data?.candidates?.[0];
    if (!cand) {
      const fb = data?.promptFeedback?.blockReason;
      return res.status(502).json({ error: fb ? `Pedido bloqueado pelo Gemini (${fb}).` : "Resposta vazia do Gemini." });
    }

    const parts = cand.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!imgPart) {
      const txt = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 200);
      return res.status(502).json({ error: txt || "O Gemini não retornou imagem." });
    }

    // sucesso: registra o uso (para o limite diário) e devolve a imagem
    await logArtUsage(access.base, access.svc, access.userId, source);

    const mime = imgPart.inlineData.mimeType || "image/png";
    return res.status(200).json({ image: `data:${mime};base64,${imgPart.inlineData.data}` });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao gerar arte: " + err.message });
  }
}
