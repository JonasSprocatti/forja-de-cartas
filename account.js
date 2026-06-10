// account.js — login (e-mail + Google), salvar/carregar cartas, galeria pública,
// avaliações (estrelas) e comentários (Supabase). Etapas 1 e 2.

const acct = document.getElementById("acctArea");

(async () => {
  const cfg = await (window.__forgeConfigReady || Promise.resolve(window.FORGE_CONFIG || {}));
  if (!cfg || !cfg.SUPABASE_URL || String(cfg.SUPABASE_URL).includes("SEU-PROJETO")) {
    if (acct) acct.innerHTML = `<span class="acct-off" title="Defina SUPABASE_URL e SUPABASE_ANON_KEY nas variáveis de ambiente para ativar o login">conta off</span>`;
    return;
  }
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    window.ForgeAuth = { user: null, token: null, isVip: false };
    const T = (m, e) => (window.toastForge ? window.toastForge(m, e) : console.log(m));
    const esc = (s) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };

    // ====================== MODAIS ======================
    const modal = el(`
      <div class="fmodal" hidden><div class="fmodal-box">
        <button class="fmodal-x" data-close>✕</button>
        <h2 class="fmodal-title">Entrar na Forja</h2>
        <button class="btn btn-google" id="gBtn"><span>G</span> Continuar com Google</button>
        <div class="fmodal-or">ou</div>
        <input type="email" id="authEmail" placeholder="seu@email.com" />
        <input type="password" id="authPass" placeholder="senha (mín. 6)" />
        <div class="fmodal-actions">
          <button class="btn btn-gold" id="loginBtn">Entrar</button>
          <button class="btn btn-ghost" id="signupBtn">Criar conta</button>
        </div>
        <p class="fmodal-hint" id="authMsg"></p>
      </div></div>`);
    const drawer = el(`
      <div class="fmodal fgallery fmine" hidden><div class="fgallery-box">
        <div class="fdrawer-head">
          <h2>Minhas cartas</h2>
          <div class="gal-head-r">
            <input id="mineSearch" placeholder="Buscar por nome…" />
            <button class="fmodal-x" data-closed>✕</button>
          </div>
        </div>
        <div class="mine-toolbar"><span class="mine-count" id="mineCount"></span></div>
        <div id="mineGrid" class="gal-grid"></div>
      </div></div>`);
    const gallery = el(`
      <div class="fmodal fgallery" hidden><div class="fgallery-box">
        <div class="fdrawer-head"><h2>Galeria da comunidade</h2>
          <div class="gal-head-r">
            <select id="gallerySort" title="ordenar">
              <option value="recent">Mais recentes</option>
              <option value="likes">Mais curtidas</option>
              <option value="stars">Melhor avaliadas</option>
            </select>
            <button class="fmodal-x" data-closeg>✕</button>
          </div>
        </div>
        <div id="galFeatured" class="gal-featured">
          <div class="feat-block">
            <h3 class="feat-title">✨ Últimas cartas</h3>
            <div id="featLatest" class="feat-row"></div>
          </div>
          <div class="feat-block">
            <div class="feat-head"><h3 class="feat-title">🏆 Mais votadas</h3>
              <div class="seg" id="featPeriod">
                <button type="button" data-p="week" class="on">Semana</button>
                <button type="button" data-p="month">Mês</button>
                <button type="button" data-p="year">Ano</button>
              </div>
            </div>
            <div id="featTop" class="feat-row"></div>
          </div>
        </div>
        <div class="gal-filters">
          <input id="galSearch" placeholder="Buscar por nome…">
          <select id="galLayout">
            <option value="">Todos os tipos</option>
            <option value="normal">Padrão</option><option value="land">Terreno</option>
            <option value="planeswalker">Planeswalker</option><option value="saga">Saga</option>
            <option value="class">Classe</option><option value="battle">Batalha</option>
            <option value="adventure">Aventura</option><option value="token">Ficha</option>
            <option value="emblem">Emblema</option><option value="dfc">Dupla face</option><option value="split">Dividida</option>
          </select>
          <select id="galRarity">
            <option value="">Toda raridade</option><option value="comum">Comum</option>
            <option value="incomum">Incomum</option><option value="rara">Rara</option><option value="mítica">Mítica</option>
          </select>
          <select id="galColor">
            <option value="">Todas as cores</option><option value="W">Branco</option><option value="U">Azul</option>
            <option value="B">Preto</option><option value="R">Vermelho</option><option value="G">Verde</option>
            <option value="multi">Multicolor</option><option value="C">Incolor</option>
          </select>
        </div>
        <div id="galGrid" class="gal-grid"></div>
      </div></div>`);
    const detail = el(`
      <div class="fmodal fdetail" hidden><div class="fdetail-box">
        <button class="fmodal-x" data-closed2>✕</button>
        <div class="fdetail-grid">
          <div class="fdetail-left"><div class="dthumb"><div class="card" id="detCard"></div></div>
            <div class="fdetail-acts">
              <button class="btn btn-gold" id="detOpen">Abrir no editor</button>
              <button class="btn btn-ghost" id="detDup">Duplicar / remixar</button>
            </div>
          </div>
          <div class="fdetail-right">
            <h2 id="detName"></h2><p class="muted" id="detMeta"></p>
            <div class="detail-social">
              <button class="like-btn" id="detLike"><span class="heart">♥</span> <span id="detLikeCount">0</span></button>
              <button class="report-btn" id="detReport" title="Denunciar carta">⚑ Denunciar</button>
            </div>
            <div class="stars" id="detStars"></div>
            <div class="comments"><h3>Comentários</h3>
              <div id="detComments" class="comment-list"></div>
              <div class="comment-add"><input id="detCommentBox" placeholder="Escreva um comentário…" maxlength="1000"/>
                <button class="btn btn-ghost" id="detCommentBtn">Enviar</button></div>
            </div>
          </div>
        </div>
      </div></div>`);
    [modal, drawer, gallery, detail].forEach((n) => document.body.appendChild(n));

    const show = (n) => (n.hidden = false), hide = (n) => (n.hidden = true);
    const openModal = () => show(modal), closeModal = () => hide(modal);
    const openDrawer = () => { show(drawer); loadMyCards(); }, closeDrawer = () => hide(drawer);
    drawer.querySelector("#mineSearch").addEventListener("input", () => renderMyCards());
    const openGallery = () => { show(gallery); loadGallery(); };
    modal.addEventListener("click", (e) => { if (e.target.dataset.close !== undefined || e.target === modal) closeModal(); });
    drawer.addEventListener("click", (e) => { if (e.target.dataset.closed !== undefined || e.target === drawer) closeDrawer(); });
    gallery.addEventListener("click", (e) => { if (e.target.dataset.closeg !== undefined || e.target === gallery) hide(gallery); });
    detail.addEventListener("click", (e) => { if (e.target.dataset.closed2 !== undefined || e.target === detail) hide(detail); });
    const msg = (m) => (modal.querySelector("#authMsg").textContent = m);

    // ====================== AUTH ======================
    modal.querySelector("#gBtn").onclick = () =>
      sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
    modal.querySelector("#loginBtn").onclick = async () => {
      const email = modal.querySelector("#authEmail").value.trim();
      const password = modal.querySelector("#authPass").value;
      if (!email || !password) return msg("Preencha o e-mail e a senha para entrar.");
      
      const { error } = await sb.auth.signInWithPassword({ email, password });
      msg(error ? error.message : ""); if (!error) closeModal();
    };
    
    modal.querySelector("#signupBtn").onclick = async () => {
      const email = modal.querySelector("#authEmail").value.trim();
      const password = modal.querySelector("#authPass").value;
      if (!email || !password) return msg("Preencha um e-mail e uma senha para criar a conta.");
      
      const { error } = await sb.auth.signUp({ email, password });
      msg(error ? error.message : "Conta criada! Se pedir, confirme o e-mail e entre."); if (!error) closeModal();
    };

    // Desenha a área de conta IMEDIATAMENTE (logado ou não).
    // A busca de VIP/admin/username acontece DEPOIS, FORA do lock de auth do
    // Supabase. Fazer `await sb.from(...)` dentro do callback de
    // onAuthStateChange causa deadlock do navigator.locks e trava a UI em
    // "a carregar a conta…" após um refresh com sessão ativa.
    function refresh(session) {
      const user = session?.user || null;
      window.ForgeAuth.user = user;
      window.ForgeAuth.token = session?.access_token || null;
      window.ForgeAuth.isVip = false;
      window.ForgeAuth.isAdmin = false;

      // 1) botões aparecem JÁ — nunca fica preso no estado de carregamento
      renderAccount(user ? user.email : null, false);
      if (!user) { if (window.ForgeAds) window.ForgeAds.update(false); return; }

      // 2) enriquecimento adiado: setTimeout(0) tira a chamada de dentro do lock
      setTimeout(async () => {
        try {
          const { data } = await sb.from("profiles")
            .select("username,is_vip,is_admin").eq("id", user.id).single();
          window.ForgeAuth.isVip = !!(data && data.is_vip);
          window.ForgeAuth.isAdmin = !!(data && data.is_admin);
          renderAccount(data?.username || user.email, window.ForgeAuth.isVip);
        } catch (e) { console.warn("profiles:", e); }
        if (window.ForgeAds) window.ForgeAds.update(window.ForgeAuth.isVip);
      }, 0);
    }

    let didInitParams = false;
    function handleDeepLinks() {
      if (didInitParams) return; didInitParams = true;
      const params = new URLSearchParams(location.search);
      if (params.get("col")) openCollectionById(params.get("col"));
      if (params.get("u")) openProfileByUsername(params.get("u"));
    }

    // INITIAL_SESSION já dispara no load com a sessão do storage, então cobre o
    // primeiro render (não precisamos de um getSession() separado, que só criava
    // corrida). NUNCA usar await de supabase diretamente neste callback.
    sb.auth.onAuthStateChange((event, session) => {
      refresh(session);
      if (event === "INITIAL_SESSION" || event === "SIGNED_IN") setTimeout(handleDeepLinks, 0);
    });

    // ---------- VIP / pagamento ----------
    async function startCheckout() {
      if (!window.ForgeAuth.user) return openModal();
      try {
        const r = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + window.ForgeAuth.token },
        });
        const d = await r.json().catch(() => ({}));
        if (r.ok && d.url) window.location.href = d.url;
        else T(d.error || "Erro ao iniciar pagamento.", true);
      } catch (e) { T("Falha de rede ao iniciar pagamento.", true); }
    }
    // retorno do Stripe Checkout
    const vipParam = new URLSearchParams(location.search).get("vip");
    if (vipParam === "success") {
      T("Pagamento recebido! Ativando seu VIP…");
      history.replaceState({}, "", location.pathname);
      setTimeout(() => sb.auth.getSession().then(({ data }) => refresh(data.session)), 4000);
    } else if (vipParam === "cancel") {
      T("Pagamento cancelado.", true);
      history.replaceState({}, "", location.pathname);
    }

    function renderAccount(name, vip) {
      const gal = `<button class="btn btn-ghost" id="galBtn">✦ Galeria</button>`;
      if (!name) {
        acct.innerHTML = gal + `<button class="btn btn-gold" id="entrarBtn">Entrar</button>`;
        acct.querySelector("#entrarBtn").onclick = openModal;
      } else {
        acct.innerHTML = gal +
          `<button class="btn btn-ghost" id="saveBtn">⤓ Salvar</button>
           <button class="btn btn-ghost" id="mineBtn">▣ Minhas cartas</button>
           <button class="btn btn-ghost" id="colBtn">❖ Coleções</button>
           <button class="btn btn-ghost" id="profBtn">☺ Perfil</button>
           ${window.ForgeAuth.isAdmin ? '<button class="btn btn-ghost" id="modBtn">⚑ Moderação</button>' : ""}
           ${vip ? "" : '<button class="btn btn-gold" id="vipBtn">★ Virar VIP</button>'}
           <span class="acct-user">${vip ? '<span class="vip">VIP</span> ' : ""}${esc(name)}</span>
           <button class="btn btn-ghost" id="logoutBtn">Sair</button>`;
        acct.querySelector("#saveBtn").onclick = saveCard;
        acct.querySelector("#mineBtn").onclick = openDrawer;
        acct.querySelector("#colBtn").onclick = openCollections;
        acct.querySelector("#profBtn").onclick = openProfileEditor;
        const mb = acct.querySelector("#modBtn"); if (mb) mb.onclick = openModeration;
        acct.querySelector("#logoutBtn").onclick = () => sb.auth.signOut();
        const vb = acct.querySelector("#vipBtn"); if (vb) vb.onclick = startCheckout;
      }
      acct.querySelector("#galBtn").onclick = openGallery;
    }

    // ====================== SALVAR / MINHAS ======================
    async function saveCard() {
      if (!window.ForgeAuth.user) return openModal();
      const data = window.Forge.serialize();
      const { error } = await sb.from("cards").insert({ user_id: window.ForgeAuth.user.id, name: data.name || "Sem nome", layout: data.layout, color: data.color, data });
      T(error ? "Erro ao salvar: " + error.message : "Carta salva!", !!error);
    }
    let myCards = [];
    async function loadMyCards() {
      const grid = drawer.querySelector("#mineGrid"); grid.innerHTML = `<p class="muted">carregando…</p>`;
      const { data, error } = await sb.from("cards").select("id,name,layout,is_public,data,created_at").eq("user_id", window.ForgeAuth.user.id).order("updated_at", { ascending: false });
      if (error) { grid.innerHTML = `<p class="muted">erro: ${error.message}</p>`; return; }
      myCards = data || [];
      renderMyCards();
    }
    function renderMyCards() {
      const grid = drawer.querySelector("#mineGrid");
      const count = drawer.querySelector("#mineCount");
      const q = (drawer.querySelector("#mineSearch").value || "").trim().toLowerCase();
      count.textContent = myCards.length ? `${myCards.length} carta${myCards.length > 1 ? "s" : ""} salva${myCards.length > 1 ? "s" : ""}` : "";
      if (!myCards.length) { grid.innerHTML = `<p class="mine-empty">Você ainda não salvou nenhuma carta. Monte uma carta e clique em <b>⤓ Salvar</b>.</p>`; return; }
      const rows = q ? myCards.filter((c) => (c.name || "").toLowerCase().includes(q)) : myCards;
      if (!rows.length) { grid.innerHTML = `<p class="mine-empty">Nenhuma carta encontrada para “${esc(q)}”.</p>`; return; }
      grid.innerHTML = "";
      rows.forEach((c) => {
        const pub = c.is_public;
        const item = el(`<div class="gal-item mine-item">
          <div class="gthumb"><div class="card"></div></div>
          <div class="gal-meta">
            <b>${esc(c.name || "Sem nome")}</b>
            <span>${esc(c.layout || "—")} · <span class="mine-badge ${pub ? "pub" : "priv"}">${pub ? "pública" : "privada"}</span></span>
          </div>
          <div class="mine-actions">
            <button data-a="load">Abrir</button>
            <button data-a="dup">Duplicar</button>
            <button data-a="col">❖ Coleção</button>
            <button data-a="pub">${pub ? "Tornar privada" : "Publicar"}</button>
            <button data-a="del" class="danger">Apagar</button>
          </div></div>`);
        window.Forge.previewInto(item.querySelector(".card"), c.data);
        const openInEditor = () => { window.Forge.load(c.data); closeDrawer(); T("Carta aberta."); };
        item.querySelector(".gthumb").onclick = openInEditor;
        item.querySelector('[data-a="load"]').onclick = openInEditor;
        item.querySelector('[data-a="dup"]').onclick = () => { window.Forge.load(c.data); closeDrawer(); T("Cópia aberta — edite e salve para criar uma nova."); };
        item.querySelector('[data-a="col"]').onclick = () => pickCollectionForCard(c.id, c.name);
        item.querySelector('[data-a="pub"]').onclick = async () => { const { error } = await sb.from("cards").update({ is_public: !c.is_public }).eq("id", c.id); if (error) T(error.message, true); else loadMyCards(); };
        item.querySelector('[data-a="del"]').onclick = async () => { if (!confirm(`Apagar “${c.name || "Sem nome"}”? Esta ação não pode ser desfeita.`)) return; const { error } = await sb.from("cards").delete().eq("id", c.id); if (error) T(error.message, true); else loadMyCards(); };
        grid.appendChild(item);
      });
    }

    // ====================== GALERIA ======================
    async function namesFor(ids) {
      const map = {};
      if (!ids.length) return map;
      const { data } = await sb.from("profiles").select("id,username").in("id", ids);
      (data || []).forEach((p) => (map[p.id] = p.username || "anônimo"));
      return map;
    }
    async function statsFor(ids) {
      const map = {};
      if (!ids.length) return map;
      const { data } = await sb.from("card_stats").select("card_id,avg_stars,votes").in("card_id", ids);
      (data || []).forEach((s) => (map[s.card_id] = s));
      return map;
    }
    async function likesFor(ids) {
      const map = {};
      if (!ids.length) return map;
      const { data } = await sb.from("card_likes").select("card_id,likes").in("card_id", ids);
      (data || []).forEach((l) => (map[l.card_id] = l.likes));
      return map;
    }
    let gallerySortBound = false;
    let featPeriodBound = false;
    function bindGalleryControls(){
      if (gallerySortBound) return; gallerySortBound = true;
      ["gallerySort","galLayout","galRarity","galColor"].forEach(id => gallery.querySelector("#"+id).addEventListener("change", loadGallery));
      let t; gallery.querySelector("#galSearch").addEventListener("input", () => { clearTimeout(t); t = setTimeout(loadGallery, 350); });
      gallery.querySelector("#featPeriod").addEventListener("click", (e) => {
        const b = e.target.closest("button[data-p]"); if (!b) return;
        gallery.querySelectorAll("#featPeriod button").forEach((x) => x.classList.toggle("on", x === b));
        loadTopVoted(b.dataset.p);
      });
    }
    async function loadGallery() {
      const grid = gallery.querySelector("#galGrid"); grid.innerHTML = `<p class="muted">carregando…</p>`;
      bindGalleryControls();
      const sort = gallery.querySelector("#gallerySort").value;
      const search = gallery.querySelector("#galSearch").value.trim();
      const layout = gallery.querySelector("#galLayout").value;
      const rarity = gallery.querySelector("#galRarity").value;
      const color = gallery.querySelector("#galColor").value;
      const filtersActive = !!(search || layout || rarity || color);
      const feat = gallery.querySelector("#galFeatured");
      feat.hidden = filtersActive;
      if (!filtersActive) loadFeatured();
      let q = sb.from("cards").select("id,name,data,user_id,layout").eq("is_public", true);
      if (search) q = q.ilike("name", "%" + search + "%");
      if (layout) q = q.eq("layout", layout);
      if (rarity) q = q.eq("data->>rarity", rarity);
      const { data, error } = await q.order("created_at", { ascending: false }).limit(120);
      if (error) return (grid.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      let rows = data || [];
      if (color) rows = rows.filter((c) => window.Forge.colorOf(c.data) === color);
      if (!rows.length) return (grid.innerHTML = `<p class="muted">${filtersActive ? "Nenhuma carta encontrada com esses filtros." : 'Ainda não há cartas públicas. Publique uma em "Minhas cartas"!'}</p>`);
      const ids = rows.map((c) => c.id);
      const authors = await namesFor([...new Set(rows.map((c) => c.user_id))]);
      const stats = await statsFor(ids);
      const likes = await likesFor(ids);
      rows.forEach((c) => { c._likes = likes[c.id] || 0; c._stars = stats[c.id] ? Number(stats[c.id].avg_stars) : 0; });
      if (sort === "likes") rows.sort((a, b) => b._likes - a._likes);
      else if (sort === "stars") rows.sort((a, b) => b._stars - a._stars);
      const top = rows.slice(0, 48);
      grid.innerHTML = "";
      top.forEach((c) => {
        const st = stats[c.id];
        const item = el(`<div class="gal-item"><div class="gthumb"><div class="card"></div></div>
          <div class="gal-meta"><b>${esc(c.name || "Sem nome")}</b><span>por <a class="author-link">${esc(authors[c.user_id] || "anônimo")}</a></span>
          <span class="gal-stats-line"><span class="gal-like">♥ ${c._likes}</span> <span class="gal-stars">★ ${st ? Number(st.avg_stars).toFixed(1) : "—"}</span></span></div></div>`);
        window.Forge.previewInto(item.querySelector(".card"), c.data);
        item.querySelector(".gthumb").onclick = () => openDetail(c, authors[c.user_id]);
        item.querySelector(".author-link").onclick = (e) => { e.stopPropagation(); openProfile(c.user_id); };
        grid.appendChild(item);
      });
    }

    // ---------- DESTAQUES (página inicial da galeria) ----------
    function featCardEl(c, author, likeCount) {
      const item = el(`<div class="feat-card"><div class="fthumb"><div class="card"></div></div>
        <div class="feat-meta"><b>${esc(c.name || "Sem nome")}</b>
        <span>por <a class="author-link">${esc(author || "anônimo")}</a>${likeCount != null ? ` · <span class="gal-like">♥ ${likeCount}</span>` : ""}</span></div></div>`);
      window.Forge.previewInto(item.querySelector(".card"), c.data);
      item.querySelector(".fthumb").onclick = () => openDetail(c, author);
      item.querySelector(".author-link").onclick = (e) => { e.stopPropagation(); openProfile(c.user_id); };
      return item;
    }
    async function loadFeatured() {
      const latestBox = gallery.querySelector("#featLatest");
      latestBox.innerHTML = `<p class="muted">carregando…</p>`;
      const { data: latest } = await sb.from("cards").select("id,name,data,user_id").eq("is_public", true).order("created_at", { ascending: false }).limit(10);
      const list = latest || [];
      const authors = await namesFor([...new Set(list.map((c) => c.user_id))]);
      latestBox.innerHTML = "";
      if (!list.length) latestBox.innerHTML = `<p class="muted">Nenhuma carta pública ainda.</p>`;
      else list.forEach((c) => latestBox.appendChild(featCardEl(c, authors[c.user_id])));
      const activePeriod = gallery.querySelector("#featPeriod button.on")?.dataset.p || "week";
      loadTopVoted(activePeriod);
    }
    async function loadTopVoted(period) {
      const box = gallery.querySelector("#featTop");
      box.innerHTML = `<p class="muted">carregando…</p>`;
      const days = period === "year" ? 365 : period === "month" ? 30 : 7;
      const cutoff = new Date(Date.now() - days * 864e5).toISOString();
      const { data: ls } = await sb.from("likes").select("card_id,created_at").gte("created_at", cutoff).limit(3000);
      const counts = {}; (ls || []).forEach((l) => (counts[l.card_id] = (counts[l.card_id] || 0) + 1));
      const topIds = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map((e) => e[0]);
      if (!topIds.length) { box.innerHTML = `<p class="muted">Sem votos nesse período ainda.</p>`; return; }
      const { data: cards } = await sb.from("cards").select("id,name,data,user_id").in("id", topIds).eq("is_public", true);
      const list = (cards || []).sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
      const authors = await namesFor([...new Set(list.map((c) => c.user_id))]);
      box.innerHTML = "";
      if (!list.length) box.innerHTML = `<p class="muted">Sem votos nesse período ainda.</p>`;
      else list.forEach((c) => box.appendChild(featCardEl(c, authors[c.user_id], counts[c.id])));
    }

    // ====================== DETALHE: estrelas + comentários ======================
    async function openDetail(card, author) {
      show(detail);
      window.Forge.previewInto(detail.querySelector("#detCard"), card.data);
      detail.querySelector("#detName").textContent = card.name || "Sem nome";
      const meta = detail.querySelector("#detMeta");
      meta.innerHTML = `por <a class="author-link">${esc(author || "anônimo")}</a>`;
      meta.querySelector(".author-link").onclick = () => { hide(detail); openProfile(card.user_id); };
      detail.querySelector("#detOpen").onclick = () => { window.Forge.load(card.data); hide(detail); hide(gallery); T("Carta aberta no editor."); };
      detail.querySelector("#detDup").onclick = () => { window.Forge.load(card.data); hide(detail); hide(gallery); T("Cópia aberta — edite e salve."); };
      await renderLikes(card.id);
      detail.querySelector("#detReport").onclick = () => reportCard(card.id);
      await renderStars(card.id);
      await renderComments(card.id);
      detail.querySelector("#detCommentBtn").onclick = async () => {
        if (!window.ForgeAuth.user) return openModal();
        const box = detail.querySelector("#detCommentBox"); const body = box.value.trim(); if (!body) return;
        const { error } = await sb.from("comments").insert({ card_id: card.id, user_id: window.ForgeAuth.user.id, body });
        if (error) T(error.message, true); else { box.value = ""; renderComments(card.id); }
      };
    }
    async function renderLikes(cardId) {
      const btn = detail.querySelector("#detLike");
      const { data: l } = await sb.from("card_likes").select("likes").eq("card_id", cardId).maybeSingle();
      detail.querySelector("#detLikeCount").textContent = l ? l.likes : 0;
      let mine = false;
      if (window.ForgeAuth.user) {
        const { data: m } = await sb.from("likes").select("card_id").eq("card_id", cardId).eq("user_id", window.ForgeAuth.user.id).maybeSingle();
        mine = !!m;
      }
      btn.classList.toggle("on", mine);
      btn.onclick = async () => {
        if (!window.ForgeAuth.user) return openModal();
        if (mine) await sb.from("likes").delete().eq("card_id", cardId).eq("user_id", window.ForgeAuth.user.id);
        else await sb.from("likes").insert({ card_id: cardId, user_id: window.ForgeAuth.user.id });
        renderLikes(cardId);
      };
    }
    async function reportCard(cardId) {
      if (!window.ForgeAuth.user) return openModal();
      const reason = prompt("Por que está denunciando esta carta? (ex.: conteúdo ofensivo, cópia, spam)");
      if (reason === null) return;
      const { error } = await sb.from("reports").insert({ card_id: cardId, reporter_id: window.ForgeAuth.user.id, reason: (reason || "").slice(0, 500) });
      if (error && error.code === "23505") T("Você já denunciou esta carta.");
      else if (error) T(error.message, true);
      else T("Denúncia enviada. Obrigado.");
    }
    async function renderStars(cardId) {
      const wrap = detail.querySelector("#detStars");
      let mine = 0;
      if (window.ForgeAuth.user) {
        const { data } = await sb.from("ratings").select("stars").eq("card_id", cardId).eq("user_id", window.ForgeAuth.user.id).maybeSingle();
        mine = data?.stars || 0;
      }
      const { data: s } = await sb.from("card_stats").select("avg_stars,votes").eq("card_id", cardId).maybeSingle();
      wrap.innerHTML = `<div class="star-row">${[1,2,3,4,5].map((n) => `<span class="star ${n <= mine ? "on" : ""}" data-n="${n}">★</span>`).join("")}</div>
        <span class="star-avg">${s ? "média " + Number(s.avg_stars).toFixed(1) + " · " + s.votes + " voto(s)" : "seja o primeiro a avaliar"}</span>`;
      wrap.querySelectorAll(".star").forEach((st) => st.onclick = async () => {
        if (!window.ForgeAuth.user) return openModal();
        const n = +st.dataset.n;
        const { error } = await sb.from("ratings").upsert({ card_id: cardId, user_id: window.ForgeAuth.user.id, stars: n });
        if (error) T(error.message, true); else renderStars(cardId);
      });
    }
    async function renderComments(cardId) {
      const box = detail.querySelector("#detComments"); box.innerHTML = `<p class="muted">…</p>`;
      const { data, error } = await sb.from("comments").select("id,body,user_id,created_at").eq("card_id", cardId).order("created_at", { ascending: false });
      if (error) return (box.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      if (!data.length) return (box.innerHTML = `<p class="muted">Nenhum comentário ainda.</p>`);
      const authors = await namesFor([...new Set(data.map((c) => c.user_id))]);
      box.innerHTML = "";
      data.forEach((c) => {
        const mine = window.ForgeAuth.user && window.ForgeAuth.user.id === c.user_id;
        const row = el(`<div class="comment"><div class="comment-head"><b>${esc(authors[c.user_id] || "anônimo")}</b>${mine ? '<button class="comment-del" title="apagar">✕</button>' : ""}</div><p>${esc(c.body)}</p></div>`);
        if (mine) row.querySelector(".comment-del").onclick = async () => { const { error } = await sb.from("comments").delete().eq("id", c.id); if (error) T(error.message, true); else renderComments(cardId); };
        box.appendChild(row);
      });
    }
    // ====================== COLEÇÕES / SETS ======================
    const colDrawer = el(`<div class="fdrawer" hidden><div class="fdrawer-box">
      <div class="fdrawer-head"><h2>Coleções</h2><button class="fmodal-x" data-cc>✕</button></div>
      <div class="col-new"><input id="colNewName" placeholder="Nome da nova coleção" maxlength="80"><button class="btn btn-gold" id="colCreate">Criar</button></div>
      <div id="colList" class="card-list"></div>
    </div></div>`);
    const colView = el(`<div class="fmodal fgallery" hidden><div class="fgallery-box">
      <div class="fdrawer-head"><h2 id="colViewName"></h2><button class="fmodal-x" data-cv>✕</button></div>
      <div class="col-actions" id="colActions"></div>
      <div id="colGrid" class="gal-grid"></div>
    </div></div>`);
    const colPick = el(`<div class="fmodal" hidden><div class="fmodal-box">
      <button class="fmodal-x" data-cp>✕</button><h2 class="fmodal-title">Adicionar cartas</h2>
      <div id="colPickList" class="card-list" style="max-height:62vh;overflow:auto"></div>
    </div></div>`);
    [colDrawer, colView, colPick].forEach((n) => document.body.appendChild(n));
    colDrawer.addEventListener("click", (e) => { if (e.target.dataset.cc !== undefined || e.target === colDrawer) hide(colDrawer); });
    colView.addEventListener("click", (e) => { if (e.target.dataset.cv !== undefined || e.target === colView) hide(colView); });
    colPick.addEventListener("click", (e) => { if (e.target.dataset.cp !== undefined || e.target === colPick) hide(colPick); });

    function openCollections() { show(colDrawer); loadCollections(); }

    async function loadCollections() {
      const list = colDrawer.querySelector("#colList"); list.innerHTML = `<p class="muted">carregando…</p>`;
      const { data, error } = await sb.from("collections").select("id,name,is_public,user_id").eq("user_id", window.ForgeAuth.user.id).order("updated_at", { ascending: false });
      if (error) return (list.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      if (!data.length) return (list.innerHTML = `<p class="muted">Nenhuma coleção ainda. Crie uma acima.</p>`);
      list.innerHTML = "";
      data.forEach((c) => {
        const row = el(`<div class="card-row"><div class="card-row-info"><b>${esc(c.name)}</b><span>${c.is_public ? "pública" : "privada"}</span></div>
          <div class="card-row-actions"><button data-a="open">Abrir</button><button data-a="print">Imprimir</button><button data-a="pub">${c.is_public ? "Tornar privada" : "Publicar"}</button><button data-a="del" class="danger">Excluir</button></div></div>`);
        row.querySelector('[data-a="open"]').onclick = () => openCollection(c);
        row.querySelector('[data-a="print"]').onclick = () => printCollection(c);
        row.querySelector('[data-a="pub"]').onclick = async () => { const { error } = await sb.from("collections").update({ is_public: !c.is_public }).eq("id", c.id); if (error) T(error.message, true); else loadCollections(); };
        row.querySelector('[data-a="del"]').onclick = async () => { const { error } = await sb.from("collections").delete().eq("id", c.id); if (error) T(error.message, true); else loadCollections(); };
        list.appendChild(row);
      });
    }
    colDrawer.querySelector("#colCreate").onclick = async () => {
      const name = colDrawer.querySelector("#colNewName").value.trim(); if (!name) return;
      const { error } = await sb.from("collections").insert({ user_id: window.ForgeAuth.user.id, name });
      if (error) T(error.message, true); else { colDrawer.querySelector("#colNewName").value = ""; loadCollections(); T("Coleção criada."); }
    };

    async function openCollection(c, forceRead) {
      const owner = window.ForgeAuth.user && window.ForgeAuth.user.id === c.user_id;
      const ro = forceRead || !owner;
      colView.querySelector("#colViewName").textContent = c.name;
      const acts = colView.querySelector("#colActions"); acts.innerHTML = "";
      const mk = (label, fn) => { const x = el(`<button class="btn btn-ghost">${label}</button>`); x.onclick = fn; acts.appendChild(x); };
      mk("🖨 Imprimir", () => printCollection(c));
      if (!ro) {
        const a = el(`<button class="btn btn-gold">＋ Adicionar cartas</button>`); a.onclick = () => openPicker(c); acts.appendChild(a);
      }
      if (c.is_public) mk("🔗 Copiar link", async () => {
        const link = location.origin + location.pathname + "?col=" + c.id;
        try { await navigator.clipboard.writeText(link); T("Link copiado!"); } catch { T(link); }
      });
      show(colView);
      renderColGrid(c, ro);
    }
    async function renderColGrid(c, ro) {
      const grid = colView.querySelector("#colGrid"); grid.innerHTML = `<p class="muted">carregando…</p>`;
      const { data, error } = await sb.from("collection_cards").select("qty,position,card_id,cards(*)").eq("collection_id", c.id).order("position", { ascending: true });
      if (error) return (grid.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      if (!data.length) return (grid.innerHTML = `<p class="muted">Coleção vazia.${ro ? "" : ' Use "Adicionar cartas".'}</p>`);
      grid.innerHTML = "";
      data.forEach((r) => {
        const card = r.cards; if (!card) return;
        const item = el(`<div class="gal-item"><div class="gthumb"><div class="card"></div></div>
          <div class="gal-meta"><b>${esc(card.name || "Sem nome")}</b>
          <div class="qty">${ro ? `<span>×${r.qty}</span>` : `<button data-d="-1">−</button><span>×${r.qty}</span><button data-d="1">+</button>`}</div>
          ${ro ? "" : '<button class="rm-link">remover</button>'}</div></div>`);
        window.Forge.previewInto(item.querySelector(".card"), card.data);
        item.querySelector(".gthumb").onclick = () => { window.Forge.load(card.data); hide(colView); hide(colDrawer); T("Carta aberta no editor."); };
        if (!ro) {
          item.querySelector('[data-d="-1"]').onclick = async () => { await sb.from("collection_cards").update({ qty: Math.max(1, r.qty - 1) }).eq("collection_id", c.id).eq("card_id", r.card_id); renderColGrid(c, ro); };
          item.querySelector('[data-d="1"]').onclick = async () => { await sb.from("collection_cards").update({ qty: Math.min(99, r.qty + 1) }).eq("collection_id", c.id).eq("card_id", r.card_id); renderColGrid(c, ro); };
          item.querySelector(".rm-link").onclick = async () => { await sb.from("collection_cards").delete().eq("collection_id", c.id).eq("card_id", r.card_id); renderColGrid(c, ro); };
        }
        grid.appendChild(item);
      });
    }
    async function openPicker(c) {
      const box = colPick.querySelector("#colPickList"); box.innerHTML = `<p class="muted">carregando…</p>`; show(colPick);
      const { data: mine } = await sb.from("cards").select("id,name,layout").eq("user_id", window.ForgeAuth.user.id).order("updated_at", { ascending: false });
      const { data: inCol } = await sb.from("collection_cards").select("card_id").eq("collection_id", c.id);
      const have = new Set((inCol || []).map((x) => x.card_id));
      const avail = (mine || []).filter((x) => !have.has(x.id));
      if (!avail.length) return (box.innerHTML = `<p class="muted">Todas as suas cartas já estão nesta coleção (ou você não tem cartas salvas).</p>`);
      box.innerHTML = "";
      avail.forEach((card) => {
        const row = el(`<div class="card-row"><div class="card-row-info"><b>${esc(card.name || "Sem nome")}</b><span>${esc(card.layout || "")}</span></div><div class="card-row-actions"><button data-a="add">Adicionar</button></div></div>`);
        row.querySelector('[data-a="add"]').onclick = async () => { const { error } = await sb.from("collection_cards").insert({ collection_id: c.id, card_id: card.id }); if (error) T(error.message, true); else { row.remove(); T("Adicionada."); renderColGrid(c, false); } };
        box.appendChild(row);
      });
    }
    async function printCollection(c) {
      const { data, error } = await sb.from("collection_cards").select("qty,cards(data)").eq("collection_id", c.id).order("position", { ascending: true });
      if (error || !data || !data.length) return T("Coleção vazia ou erro ao carregar.", true);
      if (!window.ForgePrint) return T("Impressão indisponível.", true);
      window.ForgePrint.clear();
      data.forEach((r) => { if (r.cards && r.cards.data) window.ForgePrint.add(r.cards.data, r.qty); });
      hide(colView); hide(colDrawer);
      window.ForgePrint.open();
    }
    async function openCollectionById(id) {
      const { data, error } = await sb.from("collections").select("*").eq("id", id).maybeSingle();
      if (error || !data) return T("Coleção não encontrada ou privada.", true);
      openCollection(data, true);
    }

    // adicionar UMA carta a uma coleção (a partir de "Minhas cartas")
    const cardColPick = el(`<div class="fmodal" hidden><div class="fmodal-box">
      <button class="fmodal-x" data-ccp>✕</button>
      <h2 class="fmodal-title">Adicionar à coleção</h2>
      <p class="muted" id="ccpCardName" style="margin:-6px 0 12px"></p>
      <div class="col-new"><input id="ccpNewName" placeholder="Criar nova coleção…" maxlength="80"><button class="btn btn-gold" id="ccpCreate">Criar e adicionar</button></div>
      <div id="ccpList" class="card-list" style="max-height:50vh;overflow:auto"></div>
    </div></div>`);
    document.body.appendChild(cardColPick);
    cardColPick.addEventListener("click", (e) => { if (e.target.dataset.ccp !== undefined || e.target === cardColPick) hide(cardColPick); });
    let ccpCardId = null;
    async function addCardToCollection(collectionId, cardId) {
      const { error } = await sb.from("collection_cards").insert({ collection_id: collectionId, card_id: cardId });
      if (error) { if (error.code === "23505") T("Essa carta já está nessa coleção."); else T(error.message, true); return false; }
      T("Adicionada à coleção."); return true;
    }
    async function pickCollectionForCard(cardId, cardName) {
      if (!window.ForgeAuth.user) return openModal();
      ccpCardId = cardId;
      cardColPick.querySelector("#ccpCardName").textContent = cardName ? `Carta: ${cardName}` : "";
      cardColPick.querySelector("#ccpNewName").value = "";
      const box = cardColPick.querySelector("#ccpList"); box.innerHTML = `<p class="muted">carregando…</p>`;
      show(cardColPick);
      const { data, error } = await sb.from("collections").select("id,name,is_public").eq("user_id", window.ForgeAuth.user.id).order("updated_at", { ascending: false });
      if (error) return (box.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      if (!data || !data.length) return (box.innerHTML = `<p class="muted">Você ainda não tem coleções. Crie uma acima.</p>`);
      box.innerHTML = "";
      data.forEach((c) => {
        const row = el(`<div class="card-row"><div class="card-row-info"><b>${esc(c.name)}</b><span>${c.is_public ? "pública" : "privada"}</span></div><div class="card-row-actions"><button data-a="add">Adicionar</button></div></div>`);
        row.querySelector('[data-a="add"]').onclick = async () => { if (await addCardToCollection(c.id, ccpCardId)) hide(cardColPick); };
        box.appendChild(row);
      });
    }
    cardColPick.querySelector("#ccpCreate").onclick = async () => {
      const name = cardColPick.querySelector("#ccpNewName").value.trim(); if (!name) return;
      const { data, error } = await sb.from("collections").insert({ user_id: window.ForgeAuth.user.id, name }).select("id").single();
      if (error) return T(error.message, true);
      if (await addCardToCollection(data.id, ccpCardId)) hide(cardColPick);
    };

    // ====================== MODERAÇÃO (admin) ======================
    const modDrawer = el(`<div class="fdrawer" hidden><div class="fdrawer-box">
      <div class="fdrawer-head"><h2>Moderação</h2><button class="fmodal-x" data-cm>✕</button></div>
      <div id="modList" class="card-list"></div>
    </div></div>`);
    document.body.appendChild(modDrawer);
    modDrawer.addEventListener("click", (e) => { if (e.target.dataset.cm !== undefined || e.target === modDrawer) hide(modDrawer); });
    function openModeration() { show(modDrawer); loadModeration(); }
    async function loadModeration() {
      const list = modDrawer.querySelector("#modList"); list.innerHTML = `<p class="muted">carregando…</p>`;
      const { data, error } = await sb.from("reports").select("card_id,reason,created_at,cards(*)").order("created_at", { ascending: false });
      if (error) return (list.innerHTML = `<p class="muted">erro: ${error.message}</p>`);
      if (!data.length) return (list.innerHTML = `<p class="muted">Nenhuma denúncia no momento. 🎉</p>`);
      const byCard = {};
      data.forEach((r) => { const id = r.card_id; if (!byCard[id]) byCard[id] = { card: r.cards, reasons: [], count: 0 }; byCard[id].count++; if (r.reason) byCard[id].reasons.push(r.reason); });
      list.innerHTML = "";
      Object.entries(byCard).forEach(([id, info]) => {
        const c = info.card;
        const row = el(`<div class="card-row">
          <div class="pthumb"><div class="card"></div></div>
          <div class="card-row-info"><b>${esc(c ? (c.name || "Sem nome") : "(carta removida)")}</b>
            <span>${info.count} denúncia(s)${c && c.blocked ? ' · <b style="color:#f4c9b8">bloqueada</b>' : ""}</span>
            <span class="mod-reasons">${esc(info.reasons.slice(0, 3).join(" · "))}</span></div>
          <div class="card-row-actions">
            ${c ? '<button data-a="open">Ver</button>' : ""}
            ${c && c.blocked ? '<button data-a="unblock">Desbloquear</button>' : (c ? '<button data-a="block">Bloquear</button>' : "")}
            ${c ? '<button data-a="del" class="danger">Excluir</button>' : ""}
          </div></div>`);
        if (c) {
          window.Forge.previewInto(row.querySelector(".pthumb .card"), c.data);
          const op = row.querySelector('[data-a="open"]'); if (op) op.onclick = () => { window.Forge.load(c.data); hide(modDrawer); T("Carta aberta no editor."); };
          const ub = row.querySelector('[data-a="unblock"]'); if (ub) ub.onclick = async () => { const { error } = await sb.from("cards").update({ blocked: false }).eq("id", id); if (error) T(error.message, true); else loadModeration(); };
          const bl = row.querySelector('[data-a="block"]'); if (bl) bl.onclick = async () => { const { error } = await sb.from("cards").update({ blocked: true }).eq("id", id); if (error) T(error.message, true); else loadModeration(); };
          const dl = row.querySelector('[data-a="del"]'); if (dl) dl.onclick = async () => { const { error } = await sb.from("cards").delete().eq("id", id); if (error) T(error.message, true); else loadModeration(); };
        }
        list.appendChild(row);
      });
    }

    // ====================== PERFIS ======================
    const profView = el(`<div class="fmodal fgallery" hidden><div class="fgallery-box">
      <div class="fdrawer-head"><h2 id="profName"></h2>
        <div class="gal-head-r"><button class="btn btn-ghost" id="profShare">🔗 Link</button><button class="fmodal-x" data-cpv>✕</button></div></div>
      <p class="muted" id="profBio"></p>
      <p class="prof-stats" id="profStats"></p>
      <div id="profGrid" class="gal-grid"></div>
    </div></div>`);
    const profEdit = el(`<div class="fmodal" hidden><div class="fmodal-box">
      <button class="fmodal-x" data-cpe>✕</button>
      <h2 class="fmodal-title">Seu perfil</h2>
      <input id="profUser" placeholder="nome de usuário" maxlength="40">
      <textarea id="profBioInput" rows="3" placeholder="bio (opcional)" maxlength="280"></textarea>
      <div class="fmodal-actions"><button class="btn btn-gold" id="profSave">Salvar</button></div>
      <p class="fmodal-hint" id="profMsg"></p>
    </div></div>`);
    [profView, profEdit].forEach((n) => document.body.appendChild(n));
    profView.addEventListener("click", (e) => { if (e.target.dataset.cpv !== undefined || e.target === profView) hide(profView); });
    profEdit.addEventListener("click", (e) => { if (e.target.dataset.cpe !== undefined || e.target === profEdit) hide(profEdit); });

    async function openProfile(userId) {
      if (!userId) return;
      show(profView);
      const grid = profView.querySelector("#profGrid"); grid.innerHTML = `<p class="muted">carregando…</p>`;
      const { data: prof } = await sb.from("profiles").select("username,bio").eq("id", userId).maybeSingle();
      profView.querySelector("#profName").textContent = prof?.username || "Usuário";
      profView.querySelector("#profBio").textContent = prof?.bio || "";
      const { data: cards } = await sb.from("cards").select("id,name,data,user_id").eq("user_id", userId).eq("is_public", true).order("created_at", { ascending: false }).limit(60);
      const list = cards || [];
      const likes = await likesFor(list.map((c) => c.id));
      const totalLikes = Object.values(likes).reduce((a, b) => a + b, 0);
      profView.querySelector("#profStats").textContent = `${list.length} carta(s) pública(s) · ♥ ${totalLikes}`;
      profView.querySelector("#profShare").onclick = async () => {
        if (!prof?.username) return T("Esse usuário não definiu um nome para compartilhar.", true);
        const link = location.origin + location.pathname + "?u=" + encodeURIComponent(prof.username);
        try { await navigator.clipboard.writeText(link); T("Link copiado!"); } catch { T(link); }
      };
      if (!list.length) { grid.innerHTML = `<p class="muted">Nenhuma carta pública ainda.</p>`; return; }
      grid.innerHTML = "";
      list.forEach((c) => {
        const item = el(`<div class="gal-item"><div class="gthumb"><div class="card"></div></div><div class="gal-meta"><b>${esc(c.name || "Sem nome")}</b><span class="gal-like">♥ ${likes[c.id] || 0}</span></div></div>`);
        window.Forge.previewInto(item.querySelector(".card"), c.data);
        item.querySelector(".gthumb").onclick = () => { hide(profView); openDetail(c, prof?.username); };
        grid.appendChild(item);
      });
    }
    async function openProfileByUsername(username) {
      const { data } = await sb.from("profiles").select("id").eq("username", username).maybeSingle();
      if (!data) return T("Perfil não encontrado.", true);
      openProfile(data.id);
    }
    async function openProfileEditor() {
      if (!window.ForgeAuth.user) return openModal();
      const { data } = await sb.from("profiles").select("username,bio").eq("id", window.ForgeAuth.user.id).maybeSingle();
      profEdit.querySelector("#profUser").value = data?.username || "";
      profEdit.querySelector("#profBioInput").value = data?.bio || "";
      profEdit.querySelector("#profMsg").textContent = "";
      show(profEdit);
    }
    profEdit.querySelector("#profSave").onclick = async () => {
      const username = profEdit.querySelector("#profUser").value.trim();
      const bio = profEdit.querySelector("#profBioInput").value.trim();
      if (!username) return (profEdit.querySelector("#profMsg").textContent = "Escolha um nome de usuário.");
      const { error } = await sb.from("profiles").update({ username, bio }).eq("id", window.ForgeAuth.user.id);
      if (error) profEdit.querySelector("#profMsg").textContent = error.code === "23505" ? "Esse nome já está em uso." : error.message;
      else { T("Perfil salvo."); hide(profEdit); const s = await sb.auth.getSession(); refresh(s.data.session); }
    };

  })().catch((e) => { if (acct) acct.innerHTML = `<span class="acct-off">login indisponível</span>`; console.error(e); });
