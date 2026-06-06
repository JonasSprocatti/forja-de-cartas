// api/stripe-webhook.js
// Recebe eventos da Stripe, valida a assinatura e atualiza profiles.is_vip no Supabase.
//
// Variáveis de ambiente:
//   STRIPE_WEBHOOK_SECRET           (whsec_... do endpoint de webhook criado no painel)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (para escrever em profiles, bypassa RLS)
//
// IMPORTANTE: precisa do corpo CRU (sem parse) para validar a assinatura.
export const config = { api: { bodyParser: false } };

import crypto from "crypto";

function readRaw(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

// valida a assinatura "t=...,v1=..." da Stripe sobre `${t}.${raw}`
function verifySig(raw, header, secret) {
  try {
    const parts = Object.fromEntries((header || "").split(",").map((kv) => kv.split("=")));
    if (!parts.t || !parts.v1) return false;
    const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
    const a = Buffer.from(expected), b = Buffer.from(parts.v1);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

async function setVip(userId, value) {
  const base = process.env.SUPABASE_URL, service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!base || !service || !userId) return;
  await fetch(`${base}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { apikey: service, Authorization: `Bearer ${service}`, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ is_vip: value }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await readRaw(req);
  const sig = req.headers["stripe-signature"];
  if (!secret || !verifySig(raw, sig, secret)) return res.status(400).json({ error: "Assinatura inválida." });

  let event;
  try { event = JSON.parse(raw); } catch { return res.status(400).json({ error: "JSON inválido." }); }

  try {
    const obj = event.data?.object || {};
    switch (event.type) {
      case "checkout.session.completed": {
        // pagamento concluído → ativa VIP
        const uid = obj.client_reference_id || obj.metadata?.user_id;
        if (uid) await setVip(uid, true);
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.paused": {
        // assinatura cancelada/pausada → tira VIP
        const uid = obj.metadata?.user_id;
        if (uid) await setVip(uid, false);
        break;
      }
      default:
        break; // ignora os demais
    }
  } catch (err) {
    // não falha o webhook por erro de processamento (evita reenvio infinito)
    console.error("webhook erro:", err.message);
  }

  return res.status(200).json({ received: true });
}
