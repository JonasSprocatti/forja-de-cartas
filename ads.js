// ads.js — Google AdSense para usuários não-VIP (VIP não vê anúncios).
// Configure ADSENSE_CLIENT e ADSENSE_SLOTS em config.js. Sem isso, nada é carregado.
(function () {
  const cfg = window.FORGE_CONFIG || {};
  const client = cfg.ADSENSE_CLIENT;
  const slots = cfg.ADSENSE_SLOTS || {};
  const CONTAINERS = ["adTop", "adBottom", "adPanel"]; // ids possíveis no HTML
  let scriptInjected = false, adsShown = false;

  function loadScript() {
    if (scriptInjected || !client) return;
    scriptInjected = true;
    window.adsbygoogle = window.adsbygoogle || [];
    const s = document.createElement("script");
    s.async = true; s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
    document.head.appendChild(s);
  }

  function showAds() {
    if (adsShown || !client) return;
    adsShown = true;
    loadScript();
    CONTAINERS.forEach((id) => {
      const host = document.getElementById(id);
      const slot = slots[id];
      if (!host || !slot || host.dataset.filled) return;
      host.dataset.filled = "1";
      host.hidden = false;
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.style.display = "block";
      ins.setAttribute("data-ad-client", client);
      ins.setAttribute("data-ad-slot", slot);
      ins.setAttribute("data-ad-format", "auto");
      ins.setAttribute("data-full-width-responsive", "true");
      host.appendChild(ins);
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  function hideAds() {
    CONTAINERS.forEach((id) => { const h = document.getElementById(id); if (h) h.hidden = true; });
  }

  window.ForgeAds = {
    update(isVip) { if (!client) return; isVip ? hideAds() : showAds(); },
  };

  // Sem login configurado → todo mundo é não-VIP → mostra já (se AdSense configurado).
  const supaOn = cfg.SUPABASE_URL && !String(cfg.SUPABASE_URL).includes("SEU-PROJETO");
  if (client && !supaOn) window.ForgeAds.update(false);
  // Com login, o account.js chama ForgeAds.update(isVip) assim que souber.
})();
