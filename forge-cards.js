/* ============================================================
   forge-cards.js — Forja de Cartas
   - Salvar/abrir cartas localmente (neste navegador), sem depender de login
   - Importar planilha .xlsx (nos moldes do modelo) e gerar as cartas
   - Galeria automática das cartas do arquivo (com opção de salvar ou não)
   - Galeria "Salvas" (cartas guardadas neste navegador)
   ============================================================ */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const T = (m, e) => (window.toastForge ? window.toastForge(m, e) : console.log(m));
  const esc = (s) => (s == null ? "" : String(s)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };

  /* espera o app.js expor window.Forge */
  function whenForge(cb) {
    if (window.Forge && window.Forge.previewInto && window.Forge.serialize) cb();
    else setTimeout(() => whenForge(cb), 60);
  }

  /* ============================================================
     1) ARMAZENAMENTO LOCAL (localStorage)
     ============================================================ */
  const LS_KEY = "forja_cards_local_v1";
  const loadStore = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch (_) { return []; } };
  const saveStore = (arr) => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(arr)); return true; }
    catch (e) { T("Memória do navegador cheia — apague algumas cartas salvas.", true); return false; }
  };
  const uid = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const ForgeLocal = {
    list() { return loadStore(); },
    saveData(data, meta) {
      if (!data) return null;
      const arr = loadStore();
      const rec = { id: uid(), name: data.name || "Sem nome", layout: data.layout || "normal", data, meta: meta || {}, ts: Date.now() };
      arr.unshift(rec);
      return saveStore(arr) ? rec : null;
    },
    saveMany(items) {
      const arr = loadStore();
      let n = 0;
      items.forEach((it) => {
        arr.unshift({ id: uid(), name: it.data.name || "Sem nome", layout: it.data.layout || "normal", data: it.data, meta: it.meta || {}, ts: Date.now() });
        n++;
      });
      return saveStore(arr) ? n : 0;
    },
    saveCurrent() {
      if (!window.Forge || !window.Forge.serialize) { T("O editor ainda está a carregar…", true); return null; }
      const rec = this.saveData(window.Forge.serialize());
      if (rec) {
        T("Carta salva neste navegador ✓");
        const f = $("saveStatus");
        if (f) { f.textContent = "✓ carta salva (neste navegador)"; f.classList.add("show"); setTimeout(() => f.classList.remove("show"), 1800); }
        refreshSavedCount();
      }
      return rec;
    },
    remove(id) { saveStore(loadStore().filter((r) => r.id !== id)); refreshSavedCount(); },
    clear() { saveStore([]); refreshSavedCount(); }
  };
  window.ForgeLocal = ForgeLocal;

  /* ============================================================
     2) EXPORTAR PNG (carta avulsa, fora do editor)
     ============================================================ */
  let pngHost = null;
  async function exportCardPng(data) {
    if (!window.htmlToImage) { T("Biblioteca de imagem indisponível.", true); return; }
    if (!pngHost) {
      pngHost = el(`<div style="position:fixed;left:-99999px;top:0;z-index:-1;pointer-events:none"></div>`);
      document.body.appendChild(pngHost);
    }
    const node = el(`<div class="card"></div>`);
    pngHost.appendChild(node);
    try {
      window.Forge.previewInto(node, data);
      node.style.transform = ""; node.style.transformOrigin = "";
      const url = await window.htmlToImage.toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: null });
      const a = document.createElement("a");
      a.download = (data.name || "carta").replace(/[^\w\-]+/g, "_").toLowerCase() + ".png";
      a.href = url; a.click();
    } catch (err) { T("Falha ao exportar: " + err.message, true); }
    finally { node.remove(); }
  }

  /* ============================================================
     3) PARSE DA PLANILHA (.xlsx) — nos moldes do modelo
     ============================================================ */
  const stripAccents = (s) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normHeader = (h) => stripAccents(String(h || "").toLowerCase()).replace(/[\s/.\-]+/g, "_").replace(/^_+|_+$/g, "");

  const HEADER_MAP = {
    quantidade: "qty", qtd: "qty", quant: "qty",
    nome: "name", name: "name",
    custo_de_mana: "mana", custo: "mana", mana: "mana", custo_mana: "mana",
    tipo: "type", type: "type", linha_de_tipo: "type",
    raridade: "rarity", rarity: "rarity",
    texto_de_regras: "rules", regras: "rules", texto: "rules", rules: "rules",
    poder_resistencia: "pt", poder_resistência: "pt", p_r: "pt", pr: "pt", poder: "pt",
    flavor_text: "flavor", flavor: "flavor", ambientacao: "flavor", flavour: "flavor",
    descricao_arte: "artDesc", descricao_da_arte: "artDesc", arte: "artDesc", descricao: "artDesc", art: "artDesc"
  };

  const RARITY_MAP = { mitica: "mítica", mythic: "mítica", rara: "rara", rare: "rara", incomum: "incomum", uncommon: "incomum", comum: "comum", common: "comum" };
  const mapRarity = (r) => RARITY_MAP[stripAccents(String(r || "").toLowerCase().trim())] || "comum";

  function detectLayout(typeStr) {
    const t = stripAccents(String(typeStr || "").toLowerCase());
    if (/planeswalker/.test(t)) return "planeswalker";
    if (/\bsaga\b/.test(t)) return "saga";
    if (/\bclasse\b|\bclass\b/.test(t)) return "class";
    if (/batalha|siege/.test(t)) return "battle";
    if (/ficha|token/.test(t)) return "token";
    if (/emblema|emblem/.test(t)) return "emblem";
    if (/terreno|\bland\b/.test(t)) return "land";
    return "normal";
  }

  /* converte o valor de Poder/Resistência (texto, "dd/mm" formatado OU data herdada) */
  function cleanPT(v) {
    if (v == null || v === "") return "";
    if (v instanceof Date) return v.getDate() + "/" + (v.getMonth() + 1); // dia/mês = poder/resistência
    let s = String(v).trim();
    // marcadores de "não é criatura" -> sem caixa de P/R
    if (/^(n\.?\/?a\.?|na|nenhum[a]?|none|vazio|sem|-|—|–)$/i.test(s)) return "";
    // "3/4", "03/04" ou "03/04/2026" (data dd/mm[/aaaa]) -> "3/4"
    const m = s.match(/^(\d{1,2})\s*\/\s*(\d{1,2})(?:\s*\/\s*\d{2,4})?$/);
    if (m) return parseInt(m[1], 10) + "/" + parseInt(m[2], 10);
    // data ISO herdada "2026-04-03..." -> dia/mês
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return parseInt(iso[3], 10) + "/" + parseInt(iso[2], 10);
    return s;
  }

  const fixNL = (s) => String(s == null ? "" : s).replace(/\\n/g, "\n").replace(/\r\n?/g, "\n").trim();

  /* parsers leves p/ layouts especiais (fallback p/ normal se não casar) */
  const normMinus = (s) => (s || "").replace(/\u2212/g, "−");
  function parsePW(text) {
    const out = [];
    fixNL(text).split("\n").forEach((line) => {
      const m = line.match(/^\s*([+\u2212\-]?\d+|0)\s*:\s*(.+)$/);
      if (m) out.push({ cost: normMinus(m[1].replace(/^-/, "−")), text: m[2].trim() });
    });
    return out;
  }
  function parseSaga(text) {
    const out = [];
    fixNL(text).split("\n").forEach((line) => {
      const m = line.match(/^\s*([IVXLCDM]+(?:\s*,\s*[IVXLCDM]+)*)\s*[—\-–]\s*(.+)$/i);
      if (m) out.push({ num: m[1].replace(/\s+/g, "").replace(/,/g, ", "), text: m[2].trim() });
    });
    return out;
  }

  /* transforma uma linha (objeto por cabeçalho) num "data" do window.Forge */
  function rowToCard(row, sheetName) {
    const name = String(row.name || "").trim();
    const type = String(row.type || "").trim();
    const rules = fixNL(row.rules);
    let layout = detectLayout(type);

    const base = {
      layout: "normal", color: "auto", style: "modern", foil: false, frame: "",
      name, mana: String(row.mana || "").trim(), type,
      rules, flavor: fixNL(row.flavor), pt: cleanPT(row.pt),
      rarity: mapRarity(row.rarity), artist: "você", collector: "",
      art: "", backArt: "", loyalty: "4", defense: "5",
      pw: [], saga: [], cls: [],
      adv: { name: "", mana: "", type: "", rules: "" },
      split: { name: "", mana: "", type: "", rules: "" },
      back: { name: "", mana: "", type: "", rules: "", flavor: "", pt: "" },
      overlays: []
    };

    if (layout === "planeswalker") {
      const pw = parsePW(rules);
      if (pw.length) { base.layout = "planeswalker"; base.pw = pw; base.rules = ""; }
    } else if (layout === "saga") {
      const sg = parseSaga(rules);
      if (sg.length) { base.layout = "saga"; base.saga = sg; base.rules = ""; }
    } else if (layout === "battle") {
      base.layout = "battle";
    } else if (layout === "land" || layout === "token" || layout === "emblem") {
      base.layout = layout;
    }
    // demais (class, normal) ficam como "normal" e usam rules direto
    if (base.layout === "class") base.layout = "normal";

    const meta = { sheet: sheetName || "", qty: Number(row.qty) || 1, artDesc: fixNL(row.artDesc) };
    return { data: base, meta };
  }

  /* lê o arquivo e devolve { fileName, sheets:[{name, cards:[{data,meta}]}] } */
  async function parseWorkbook(file) {
    if (!window.XLSX) throw new Error("A biblioteca de planilhas ainda não carregou. Tente de novo em alguns segundos.");
    const buf = await file.arrayBuffer();
    const wb = window.XLSX.read(buf, { type: "array", cellDates: true });
    const sheets = [];
    wb.SheetNames.forEach((sn) => {
      const ws = wb.Sheets[sn];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });
      if (!rows.length) return;
      // acha a linha de cabeçalho (a 1ª que tenha "nome")
      let hIdx = 0;
      for (let i = 0; i < Math.min(rows.length, 5); i++) {
        const keys = rows[i].map(normHeader);
        if (keys.includes("nome") || keys.includes("name")) { hIdx = i; break; }
      }
      const headers = rows[hIdx].map((h) => HEADER_MAP[normHeader(h)] || normHeader(h));
      const cards = [];
      for (let i = hIdx + 1; i < rows.length; i++) {
        const r = rows[i]; if (!r) continue;
        const obj = {};
        headers.forEach((key, c) => { if (key) obj[key] = r[c]; });
        if (!String(obj.name || "").trim()) continue; // pula linhas vazias
        cards.push(rowToCard(obj, sn));
      }
      if (cards.length) sheets.push({ name: sn, cards });
    });
    if (!sheets.length) throw new Error("Nenhuma carta encontrada. Confira se a planilha tem a coluna “Nome”. Use o modelo como base.");
    return { fileName: file.name || "planilha", sheets };
  }

  /* gera e baixa o modelo .xlsx no próprio navegador (sem depender de servidor) */
  function downloadTemplate() {
    if (!window.XLSX) { window.open("modelo-cartas.xlsx", "_blank"); return; }
    const headers = ["Quantidade", "Nome", "Custo_de_Mana", "Tipo", "Raridade", "Texto_de_Regras", "Poder_Resistencia", "Flavor_Text", "Descricao_Arte"];
    const rows = [
      [1, "Guardiã das Brumas", "{2}{W}{U}", "Criatura — Humano Mago", "Rara",
        "Lampejo (Você pode conjurar esta mágica a qualquer momento que pudesse conjurar um instantâneo.)\nQuando a Guardiã das Brumas entrar no campo de batalha, exile uma criatura alvo até que ela deixe o campo.",
        "3/4", '"A névoa não esconde. Ela escolhe o que mostrar."', "Uma maga envolta em névoa azul-prateada, luz dramática."],
      [1, "Vorme das Dunas", "{4}{G}{G}", "Criatura — Vorme", "Mítica",
        "Atropelar, vigilância\nEsta mágica custa {1} a menos para cada Deserto que você controla.",
        "7/7", "O deserto inteiro é a sua boca.", "Verme colossal irrompendo da areia."],
      [2, "Faísca Errante", "{R}", "Mágica Instantânea", "Comum",
        "Faísca Errante causa 2 pontos de dano a qualquer alvo.", "", "Pequena, rápida, fatal.", "Relâmpago vermelho no céu do deserto."]
    ];
    const aoa = [headers, ...rows];
    const ws = window.XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 12 }, { wch: 30 }, { wch: 16 }, { wch: 32 }, { wch: 12 }, { wch: 56 }, { wch: 16 }, { wch: 38 }, { wch: 56 }];
    // força a coluna G (Poder_Resistencia) como TEXTO p/ não virar data
    for (let r = 1; r <= rows.length; r++) {
      const ref = window.XLSX.utils.encode_cell({ r, c: 6 });
      if (ws[ref]) { ws[ref].t = "s"; ws[ref].z = "@"; }
    }
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Exemplo");
    window.XLSX.writeFile(wb, "modelo-cartas.xlsx");
  }

  /* ============================================================
     4) INTERFACE
     ============================================================ */
  whenForge(init);

  function init() {
    /* ----- modal IMPORTAR ----- */
    const importModal = el(`
      <div class="fmodal" id="fxImport" hidden><div class="fmodal-box fx-import-box">
        <button class="fmodal-x" data-x>✕</button>
        <h2 class="fmodal-title">Importar planilha de cartas</h2>
        <p class="fx-lead">Crie várias cartas de uma vez a partir de uma planilha <b>.xlsx</b> nos moldes do modelo. Cada aba vira uma seção da galeria.</p>
        <button class="btn btn-ghost fx-tmpl" id="fxTemplate">⤓ Baixar modelo (.xlsx)</button>
        <label class="dropzone fx-drop" id="fxDrop">
          <input type="file" id="fxFile" accept=".xlsx,.xls" hidden />
          <span class="dz-icon">📥</span>
          <span class="dz-text">Clique ou arraste a sua planilha .xlsx aqui</span>
        </label>
        <p class="fx-status" id="fxStatus" aria-live="polite"></p>
        <p class="hint">Colunas: Quantidade · Nome · Custo_de_Mana · Tipo · Raridade · Texto_de_Regras · Poder_Resistencia · Flavor_Text · Descricao_Arte. A imagem da arte não vem da planilha — adicione no editor depois.</p>
      </div></div>`);

    /* ----- galeria de REVISÃO (cartas do arquivo) ----- */
    const review = el(`
      <div class="fmodal fgallery" id="fxReview" hidden><div class="fgallery-box">
        <div class="fdrawer-head">
          <h2 id="fxReviewTitle">Cartas da planilha</h2>
          <button class="fmodal-x" data-x>✕</button>
        </div>
        <div class="fx-tabs" id="fxTabs"></div>
        <div class="fx-toolbar">
          <span id="fxSel" class="fx-sel"></span>
          <div class="fx-tools">
            <button class="btn btn-ghost" id="fxAll">Marcar todas</button>
            <button class="btn btn-ghost" id="fxNone">Desmarcar</button>
            <label class="chk fx-cloud" id="fxCloudWrap" hidden><input type="checkbox" id="fxCloud" checked> também salvar na minha conta</label>
            <button class="btn btn-gold" id="fxSave">⤓ Salvar selecionadas</button>
          </div>
        </div>
        <div class="gal-grid fx-grid" id="fxGrid"></div>
      </div></div>`);

    /* ----- galeria SALVAS (neste navegador) ----- */
    const saved = el(`
      <div class="fmodal fgallery" id="fxSaved" hidden><div class="fgallery-box">
        <div class="fdrawer-head">
          <h2>Cartas salvas <span class="fx-sub">(neste navegador)</span></h2>
          <button class="fmodal-x" data-x>✕</button>
        </div>
        <div class="fx-toolbar">
          <span id="fxSavedCount" class="fx-sel"></span>
          <div class="fx-tools">
            <button class="btn btn-ghost" id="fxSavedClear">Apagar todas</button>
          </div>
        </div>
        <div class="gal-grid fx-grid" id="fxSavedGrid"></div>
      </div></div>`);

    [importModal, review, saved].forEach((n) => document.body.appendChild(n));

    const show = (n) => { n.hidden = false; document.body.style.overflow = "hidden"; };
    const hide = (n) => { n.hidden = true; if (![importModal, review, saved].some((m) => !m.hidden)) document.body.style.overflow = ""; };
    [importModal, review, saved].forEach((n) => {
      n.addEventListener("click", (e) => { if (e.target === n || e.target.dataset.x !== undefined) hide(n); });
    });

    /* ---------- topbar: liga os botões ---------- */
    const btnImport = $("btnImport"), btnSaved = $("btnSaved"), btnSaveTop = $("btnSaveTop");
    if (btnImport) btnImport.onclick = () => { $("fxStatus").textContent = ""; show(importModal); };
    if (btnSaved) btnSaved.onclick = () => openSaved();
    if (btnSaveTop) btnSaveTop.onclick = () => {
      const cloud = $("saveBtn");                 // botão de salvar na conta (aparece se logado)
      if (cloud) cloud.click(); else ForgeLocal.saveCurrent();
    };
    $("fxTemplate").onclick = downloadTemplate;

    /* ---------- importar: dropzone ---------- */
    const drop = $("fxDrop"), fileInput = $("fxFile"), statusEl = $("fxStatus");
    const handleFile = async (file) => {
      if (!file) return;
      if (!/\.(xlsx|xls)$/i.test(file.name)) { statusEl.textContent = "Envie um arquivo .xlsx"; statusEl.classList.add("err"); return; }
      statusEl.classList.remove("err"); statusEl.textContent = "A ler a planilha…";
      try {
        const wbData = await parseWorkbook(file);
        statusEl.textContent = "";
        hide(importModal);
        openReview(wbData);
      } catch (err) { statusEl.textContent = err.message; statusEl.classList.add("err"); }
    };
    fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));
    ["dragover", "dragenter"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove("drag"); }));
    drop.addEventListener("drop", (e) => { const f = e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handleFile(f); });

    /* ---------- galeria de revisão ---------- */
    let current = null;        // { fileName, sheets }
    let activeTab = "__all";
    let selected = new Set();  // chaves de cartas marcadas

    const cardKey = (si, ci) => si + ":" + ci;

    function flatCards() {
      const out = [];
      current.sheets.forEach((sh, si) => sh.cards.forEach((c, ci) => out.push({ sh, si, c, ci, key: cardKey(si, ci) })));
      return out;
    }

    function openReview(wbData) {
      current = wbData;
      activeTab = "__all";
      selected = new Set(flatCards().map((x) => x.key)); // tudo marcado por padrão
      $("fxReviewTitle").textContent = `Cartas de “${wbData.fileName}”`;
      // tabs (abas/facções)
      const tabs = $("fxTabs");
      const total = flatCards().length;
      let html = `<button class="fx-tab on" data-t="__all">Todas <span>${total}</span></button>`;
      wbData.sheets.forEach((sh, si) => { html += `<button class="fx-tab" data-t="${si}">${esc(sh.name)} <span>${sh.cards.length}</span></button>`; });
      tabs.innerHTML = html;
      tabs.querySelectorAll(".fx-tab").forEach((b) => b.onclick = () => {
        tabs.querySelectorAll(".fx-tab").forEach((x) => x.classList.remove("on"));
        b.classList.add("on"); activeTab = b.dataset.t; renderReviewGrid();
      });
      // mostra opção "salvar na conta" só quando logado
      const cloudWrap = $("fxCloudWrap");
      cloudWrap.hidden = !(window.ForgeCloud && window.ForgeCloud.available);
      renderReviewGrid();
      show(review);
    }

    function renderReviewGrid() {
      const grid = $("fxGrid");
      const items = flatCards().filter((x) => activeTab === "__all" || String(x.si) === String(activeTab));
      grid.innerHTML = "";
      items.forEach((x) => {
        const checked = selected.has(x.key);
        const item = el(`
          <div class="gal-item fx-item">
            <label class="fx-pick"><input type="checkbox" ${checked ? "checked" : ""}> salvar</label>
            <div class="gthumb"><div class="card"></div></div>
            <div class="gal-meta">
              <b>${esc(x.c.data.name || "Sem nome")}</b>
              <span>${esc(x.c.data.type || x.c.data.layout || "—")} · ${esc(x.c.data.rarity || "")}</span>
            </div>
            <div class="fx-item-acts">
              <button data-a="open">Abrir</button>
              <button data-a="png">⤓ PNG</button>
            </div>
          </div>`);
        window.Forge.previewInto(item.querySelector(".card"), x.c.data);
        const cb = item.querySelector(".fx-pick input");
        cb.addEventListener("change", () => { cb.checked ? selected.add(x.key) : selected.delete(x.key); updateSelCount(); });
        item.querySelector('[data-a="open"]').onclick = () => { window.Forge.load(x.c.data); hide(review); T("Carta aberta no editor."); };
        item.querySelector('[data-a="png"]').onclick = () => exportCardPng(x.c.data);
        item.querySelector(".gthumb").onclick = () => { window.Forge.load(x.c.data); hide(review); T("Carta aberta no editor."); };
        grid.appendChild(item);
      });
      updateSelCount();
    }

    function updateSelCount() {
      const total = flatCards().length;
      $("fxSel").textContent = `${selected.size} de ${total} marcada(s) para salvar`;
      $("fxSave").textContent = `⤓ Salvar selecionadas (${selected.size})`;
    }

    $("fxAll").onclick = () => { selected = new Set(flatCards().map((x) => x.key)); renderReviewGrid(); };
    $("fxNone").onclick = () => { selected.clear(); renderReviewGrid(); };

    $("fxSave").onclick = async () => {
      const chosen = flatCards().filter((x) => selected.has(x.key));
      if (!chosen.length) { T("Marque ao menos uma carta para salvar.", true); return; }
      const items = chosen.map((x) => ({ data: x.c.data, meta: x.c.meta }));
      // conta (Supabase) se logado e marcado
      const cloudWrap = $("fxCloudWrap");
      const wantsCloud = !cloudWrap.hidden && $("fxCloud").checked && window.ForgeCloud && window.ForgeCloud.available;
      if (wantsCloud) {
        const btn = $("fxSave"); btn.disabled = true; btn.textContent = "Salvando na conta…";
        let ok = 0, fail = 0;
        for (const it of items) { try { await window.ForgeCloud.save(it.data); ok++; } catch (_) { fail++; } }
        btn.disabled = false; updateSelCount();
        T(fail ? `${ok} salvas na conta, ${fail} falharam.` : `${ok} carta(s) salvas na sua conta ✓`, !!fail);
      } else {
        const n = ForgeLocal.saveMany(items);
        if (n) { T(`${n} carta(s) salvas neste navegador ✓`); refreshSavedCount(); }
      }
    };

    /* ---------- galeria de salvas ---------- */
    function openSaved() {
      const grid = $("fxSavedGrid");
      const list = ForgeLocal.list();
      $("fxSavedCount").textContent = list.length ? `${list.length} carta(s) salva(s) neste navegador` : "";
      grid.innerHTML = "";
      if (!list.length) {
        grid.innerHTML = `<p class="mine-empty">Nenhuma carta salva ainda. Monte ou importe cartas e clique em <b>💾 Salvar</b>.</p>`;
      } else {
        list.forEach((rec) => {
          const item = el(`
            <div class="gal-item fx-item">
              <div class="gthumb"><div class="card"></div></div>
              <div class="gal-meta">
                <b>${esc(rec.name)}</b>
                <span>${esc((rec.data && rec.data.type) || rec.layout || "—")}</span>
              </div>
              <div class="fx-item-acts">
                <button data-a="open">Abrir</button>
                <button data-a="png">⤓ PNG</button>
                <button data-a="del" class="danger">Apagar</button>
              </div>
            </div>`);
          window.Forge.previewInto(item.querySelector(".card"), rec.data);
          const open = () => { window.Forge.load(rec.data); hide(saved); T("Carta aberta no editor."); };
          item.querySelector(".gthumb").onclick = open;
          item.querySelector('[data-a="open"]').onclick = open;
          item.querySelector('[data-a="png"]').onclick = () => exportCardPng(rec.data);
          item.querySelector('[data-a="del"]').onclick = () => { if (confirm(`Apagar “${rec.name}”?`)) { ForgeLocal.remove(rec.id); openSaved(); } };
          grid.appendChild(item);
        });
      }
      show(saved);
    }
    $("fxSavedClear").onclick = () => { if (ForgeLocal.list().length && confirm("Apagar TODAS as cartas salvas neste navegador?")) { ForgeLocal.clear(); openSaved(); } };

    /* contador no botão "Salvas" */
    window.__forgeRefreshSaved = refreshSavedCount;
    refreshSavedCount();

    /* fecha modais com ESC (integra com o handler existente do app) */
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      [saved, review, importModal].some((n) => { if (!n.hidden) { hide(n); return true; } return false; });
    });
  }

  function refreshSavedCount() {
    const b = $("btnSaved"); if (!b) return;
    const n = ForgeLocal.list().length;
    b.innerHTML = n ? `▣ Salvas <span class="fx-badge">${n}</span>` : "▣ Salvas";
  }
})();
