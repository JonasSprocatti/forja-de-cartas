// ads.js — Google AdSense para usuários não-VIP (VIP não vê anúncios).
// A config pública (ADSENSE_CLIENT, ADSENSE_SLOTS) vem das variáveis de ambiente
// via /api/config. Sem isso, nada é carregado.
(function () {
  let client = null, slots = {}, ready = false, pendingVip = null, supaOn = false;
  const CONTAINERS = ["adTop", "adBottom", "adPanel"];
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
  function watchFill(host, ins) {
    // O AdSense escreve data-ad-status="filled"|"unfilled" no <ins> quando a
    // requisicao resolve. Se nao preencher (site em revisao, sem inventario,
    // bloqueador), recolhemos o espaco para nao exibir a caixa "Publicidade" vazia.
    let settled = false;
    const collapse = () => { settled = true; host.hidden = true; host.dataset.filled = ""; };
    const obs = new MutationObserver(() => {
      const status = ins.getAttribute("data-ad-status");
      if (!status || settled) return;
      obs.disconnect();
      if (status === "filled") { settled = true; }
      else collapse();
    });
    obs.observe(ins, { attributes: true, attributeFilter: ["data-ad-status"] });
    setTimeout(() => {
      if (settled) return;
      if (ins.getAttribute("data-ad-status") !== "filled") { obs.disconnect(); collapse(); }
    }, 6000);
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
      watchFill(host, ins);
    });
  }
  function hideAds() {
    CONTAINERS.forEach((id) => { const h = document.getElementById(id); if (h) h.hidden = true; });
  }

  // Disponível de imediato; aplica assim que a config chegar.
  window.ForgeAds = {
    update(isVip) {
      if (!ready) { pendingVip = isVip; return; }
      if (!client) return;
      isVip ? hideAds() : showAds();
    },
  };

  (async () => {
    const cfg = await (window.__forgeConfigReady || Promise.resolve(window.FORGE_CONFIG || {}));
    client = cfg.ADSENSE_CLIENT || null;
    slots = cfg.ADSENSE_SLOTS || {};
    supaOn = !!(cfg.SUPABASE_URL && !String(cfg.SUPABASE_URL).includes("SEU-PROJETO"));
    ready = true;
    if (!client) return;
    if (pendingVip !== null) { pendingVip ? hideAds() : showAds(); }
    else if (!supaOn) showAds(); // sem login configurado → todos são não-VIP
    // com login, o account.js chama ForgeAds.update(isVip) quando souber.
  })();
})();
