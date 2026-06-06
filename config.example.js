// Copie este arquivo para "config.js" e preencha. Sem ele, o app funciona sem login/anúncios.
// (URL/anon key do Supabase e o client do AdSense são públicos — podem ir no front-end.)
window.FORGE_CONFIG = {
  // ----- Supabase (login + cartas + galeria) -----
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA_ANON_KEY",

  // ----- Google AdSense (opcional) — anúncios para não-VIP -----
  ADSENSE_CLIENT: "",            // ex.: "ca-pub-1234567890123456"
  ADSENSE_SLOTS: {}              // ex.: { "adTop": "1234567890", "adBottom": "0987654321" }
};
