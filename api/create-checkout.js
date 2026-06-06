// api/create-checkout.js
// Cria uma sessão de Stripe Checkout para o usuário virar VIP.
// O preço/moeda/recorrência são definidos por VOCÊ no painel da Stripe (um "Price").
//
// Variáveis de ambiente:
//   STRIPE_SECRET_KEY   (sk_live_... ou sk_test_...)
//   STRIPE_PRICE_ID     (price_... criado no painel da Stripe)
//   STRIPE_MODE         ("subscription" para recorrente, "payment" para único; padrão: subscription)
//   SUPABASE_URL, SUPABASE_ANON_KEY (para identificar o usuário logado)

async function getUser(req) {
  const base = process.env.SUPABASE_URL, anon = process.env.SUPABASE_ANON_KEY;
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!base || !token) return null;
  const r = await fetch(`${base}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u?.id ? u : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

  const sk = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;
  const mode = process.env.STRIPE_MODE || "subscription";
  if (!sk || !price) return res.status(500).json({ error: "Stripe não configurado no servidor (STRIPE_SECRET_KEY / STRIPE_PRICE_ID)." });

  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: "Faça login para assinar." });

  const origin = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : "");

  // corpo form-urlencoded para a API da Stripe
  const form = new URLSearchParams();
  form.set("mode", mode);
  form.set("line_items[0][price]", price);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", `${origin}/?vip=success`);
  form.set("cancel_url", `${origin}/?vip=cancel`);
  form.set("client_reference_id", user.id);
  if (user.email) form.set("customer_email", user.email);
  form.set("metadata[user_id]", user.id);
  if (mode === "subscription") form.set("subscription_data[metadata][user_id]", user.id);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${sk}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: data?.error?.message || "Erro na Stripe." });
    return res.status(200).json({ url: data.url });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao criar checkout: " + err.message });
  }
}
