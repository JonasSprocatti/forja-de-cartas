// OPCIONAL — só para desenvolvimento 100% estático (sem backend).
// Em produção (Vercel/Render) NÃO use este arquivo: defina as variáveis de
// ambiente e o app lê tudo automaticamente via /api/config.
//
// Para dev local sem backend, copie para "config.js" e preencha (só valores PÚBLICOS):
window.FORGE_CONFIG = {
  SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY: "SUA_ANON_KEY",
  ADSENSE_CLIENT: "",   // opcional, ex.: "ca-pub-123..."
  ADSENSE_SLOTS: {}     // opcional, ex.: { "adTop": "123", "adBottom": "456" }
};
