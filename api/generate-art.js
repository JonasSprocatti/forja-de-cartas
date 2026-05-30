// api/generate-art.js
// Função serverless (Node) — gera a ilustração da carta.
// Por padrão usa a API de imagens da OpenAI (a Anthropic não gera imagens).
//
// Variáveis de ambiente:
//   OPENAI_API_KEY   (obrigatória para gerar arte)
//   OPENAI_IMAGE_MODEL (opcional — padrão: gpt-image-1)
//
// Retorna { image: "data:image/png;base64,...." } pronto para usar no <img>.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "OPENAI_API_KEY não configurada. Configure no servidor ou suba sua própria imagem.",
    });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt = "" } = body || {};
  if (!prompt.trim()) return res.status(400).json({ error: "Prompt vazio." });

  const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

  // moldura segura: arte de fantasia, sem marcas/IP
  const fullPrompt = `Fantasy trading card illustration, original artwork (no logos, no text, no copyrighted characters): ${prompt}. Dramatic lighting, painterly digital art, landscape composition.`;

  try {
    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: `API de imagem retornou ${r.status}.`, detail });
    }

    const data = await r.json();
    const item = data?.data?.[0] || {};

    // gpt-image-1 retorna b64_json; alguns modelos retornam url
    if (item.b64_json) {
      return res.status(200).json({ image: `data:image/png;base64,${item.b64_json}` });
    }
    if (item.url) {
      return res.status(200).json({ image: item.url });
    }
    return res.status(502).json({ error: "Resposta da API sem imagem." });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao gerar arte: " + err.message });
  }
}
