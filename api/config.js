// api/config.js
// Entrega a configuração PÚBLICA do frontend a partir das variáveis de ambiente.
// Importante: estes valores são públicos por natureza (a anon key do Supabase e o
// client do AdSense vão para o navegador de qualquer forma). As chaves SECRETAS
// (service role, Stripe, Gemini) NUNCA são expostas aqui.
//
// Variáveis lidas: SUPABASE_URL, SUPABASE_ANON_KEY, ADSENSE_CLIENT, ADSENSE_SLOTS (JSON).
export default function handler(req, res) {
  let slots = {};
  try { if (process.env.ADSENSE_SLOTS) slots = JSON.parse(process.env.ADSENSE_SLOTS); } catch (e) { slots = {}; }
  res.setHeader("Cache-Control", "public, max-age=60");
  return res.status(200).json({
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
    ADSENSE_CLIENT: process.env.ADSENSE_CLIENT || "",
    ADSENSE_SLOTS: slots,
  });
}
