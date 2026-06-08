// api/generate-art.js
// Função serverless (Node) — gera a ilustração da carta usando a API do Google Gemini.
// Usa a MESMA chave do texto (GEMINI_API_KEY).
//
// Variáveis de ambiente:
//   GEMINI_API_KEY      (obrigatória para gerar arte)
//   GEMINI_IMAGE_MODEL  (opcional — padrão: gemini-2.5-flash-image, que tem nível gratuito)
//
// Retorna { image: "data:image/png;base64,...." } pronto para usar no <img>.

// Verifica VIP no servidor. Só atua se SUPABASE_URL estiver configurada.
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
  if (!apiKey) {
    return res.status(500).json({
      error: "GEMINI_API_KEY não configurada. Configure no servidor ou suba sua própria imagem.",
    });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt = "" } = body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vazio." });

  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

  // moldura segura: arte de fantasia, sem marcas/IP, sem texto na imagem
  const fullPrompt = `Fantasy trading card illustration, original artwork. No logos, no text, no watermarks, no copyrighted characters. ${prompt}. Dramatic lighting, painterly digital art, cinematic composition.`;

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

    // procura a parte que contém a imagem (inlineData base64)
    const parts = cand.content?.parts || [];
    const imgPart = parts.find((p) => p.inlineData && p.inlineData.data);
    if (!imgPart) {
      // às vezes o modelo responde só texto (ex.: recusa) — devolve esse texto como erro
      const txt = parts.map((p) => p.text).filter(Boolean).join(" ").slice(0, 200);
      return res.status(502).json({ error: txt || "O Gemini não retornou imagem." });
    }

    const mime = imgPart.inlineData.mimeType || "image/png";
    return res.status(200).json({ image: `data:${mime};base64,${imgPart.inlineData.data}` });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao gerar arte: " + err.message });
  }
}
