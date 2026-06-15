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
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const LIMIT_MSG = "Você excedeu o limite de criação de cartas diária para usuário não-VIP, aguarde 24 horas até utilizar novamente.";

  /* proporção da arte por layout (parametrizada no código; padrão 3:2 = janela normal) */
  const ART_ASPECT = { saga: "3:4", planeswalker: "4:3", battle: "16:9", emblem: "16:9", class: "16:9", token: "4:3", land: "3:2" };
  const aspectFor = (layout) => ART_ASPECT[layout] || "3:2";

  /* gera a arte de uma carta via /api/generate-art (prompt = Descrição + Nome + Tipo) */
  async function generateArt(data, meta) {
    const token = window.ForgeAuth && window.ForgeAuth.token;
    const prompt = [meta && meta.artDesc, data.name, data.type].filter(Boolean).join(" — ");
    let r;
    try {
      r = await fetch("/api/generate-art", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: "Bearer " + token } : {}),
        body: JSON.stringify({ prompt, aspect: aspectFor(data.layout), source: "bulk" })
      });
    } catch (netErr) {
      const e = new Error("falha de rede ao falar com a IA (" + (netErr.message || "sem conexão") + ")"); e.status = 0; throw e;
    }
    let d = {};
    try { d = await r.json(); } catch (_) { d = {}; }
    if (!r.ok) { const e = new Error(d && d.error ? d.error : ("a IA respondeu com erro HTTP " + r.status)); e.status = r.status; throw e; }
    if (!d.image) { const e = new Error("a IA não retornou nenhuma imagem"); e.status = r.status; throw e; }
    return d.image;
  }

  /* gera com novas tentativas em erros transitórios (limite por minuto 429, 5xx, rede) */
  async function generateArtRetry(data, meta, onRetry) {
    let attempt = 0;
    while (true) {
      try { return await generateArt(data, meta); }
      catch (e) {
        const st = e.status || 0;
        const fatal = st === 401 || st === 403 || st === 429 || /vip|sess|login|api ?key|não configurada|exclusiv|limite|cota|desativad/i.test(e.message || "");
        const transient = !fatal && (st === 0 || (st >= 500 && st <= 599));
        if (fatal || !transient || attempt >= 3) throw e;
        attempt++;
        const wait = 4000 * attempt; // 4s, 8s, 12s
        if (onRetry) onRetry(attempt, wait, e);
        await sleep(wait);
      }
    }
  }

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
        <div class="fx-options" id="fxOptions"></div>
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

    /* ----- tela de PROGRESSO de salvamento (com barra + log de erros) ----- */
    const progModal = el(`
      <div class="fmodal fx-prog-modal" id="fxProgModal" hidden><div class="fx-prog-box">
        <h2 class="fmodal-title" id="fxProgTitle">Salvando…</h2>
        <p class="fx-prog-phase" id="fxProgPhase">Preparando…</p>
        <div class="fx-prog-track"><div class="fx-prog-fill" id="fxProgFill"></div></div>
        <div class="fx-prog-meta"><span id="fxProgPct">0%</span><span id="fxProgStep"></span></div>
        <div class="fx-prog-errors" id="fxProgErrors" hidden>
          <b id="fxProgErrTitle">Avisos / erros</b>
          <ul id="fxProgErrList"></ul>
        </div>
        <button class="btn btn-gold fx-prog-close" id="fxProgClose" hidden>Fechar</button>
      </div></div>`);
    document.body.appendChild(progModal);

    const Prog = {
      _errs: 0,
      _admin() { return !!(window.ForgeAuth && window.ForgeAuth.isAdmin); },
      open(title) {
        this._errs = 0;
        $("fxProgTitle").textContent = title || "Salvando…";
        $("fxProgPhase").textContent = "Preparando…";
        $("fxProgFill").style.width = "0%";
        $("fxProgPct").textContent = "0%";
        $("fxProgStep").textContent = "";
        $("fxProgErrors").hidden = true;
        $("fxProgErrTitle").textContent = "Avisos / erros";
        $("fxProgErrList").innerHTML = "";
        $("fxProgClose").hidden = true;
        progModal.hidden = false;
        document.body.style.overflow = "hidden";
      },
      phase(t) { $("fxProgPhase").textContent = t || ""; },
      step(done, total, label) {
        const p = total ? Math.round((done / total) * 100) : 0;
        $("fxProgFill").style.width = p + "%";
        $("fxProgPct").textContent = p + "%";
        if (label !== undefined) $("fxProgStep").textContent = label;
      },
      // log detalhado só para ADMIN; demais usuários veem apenas uma contagem no fim
      error(msg) {
        this._errs++;
        if (!this._admin()) return;
        $("fxProgErrors").hidden = false;
        $("fxProgErrTitle").textContent = "Avisos / erros (admin)";
        const li = document.createElement("li");
        li.textContent = msg;
        $("fxProgErrList").appendChild(li);
      },
      done(title) {
        if (title) $("fxProgTitle").textContent = title;
        $("fxProgPhase").textContent = "";
        $("fxProgStep").textContent = "";
        if (!this._admin() && this._errs > 0) {
          $("fxProgErrors").hidden = false;
          $("fxProgErrTitle").textContent = "Atenção";
          $("fxProgErrList").innerHTML = `<li>${this._errs} item(ns) não puderam ser processados. Tente novamente mais tarde.</li>`;
        }
        $("fxProgClose").hidden = false;
      },
      close() { progModal.hidden = true; if (![importModal, review, saved].some((m) => !m.hidden)) document.body.style.overflow = ""; }
    };
    $("fxProgClose").onclick = () => Prog.close();

    /* ---------- topbar: liga os botões ---------- */
    const btnImport = $("btnImport"), btnSaved = $("btnSaved"), btnSaveTop = $("btnSaveTop");
    if (btnImport) btnImport.onclick = () => { $("fxStatus").textContent = ""; show(importModal); };
    if (btnSaved) btnSaved.onclick = () => openSaved();
    if (btnSaveTop) btnSaveTop.onclick = async () => {
      if (window.ForgeCloud && window.ForgeCloud.available) {
        await window.ForgeCloud.saveCurrent();   // logado: salva na conta (mostra a mensagem de limite se exceder)
      } else {
        ForgeLocal.saveCurrent();                // sem login: salva neste navegador (grátis)
      }
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
      renderReviewOptions();
      renderReviewGrid();
      show(review);
    }

    /* monta as opções de coleção / arte por IA conforme login, VIP e nº de abas */
    function renderReviewOptions() {
      const box = $("fxOptions");
      const logged = !!(window.ForgeCloud && window.ForgeCloud.available);
      const vip = !!(window.ForgeCloud && window.ForgeCloud.isVip);
      const multi = current.sheets.length > 1;
      const baseName = String(current.fileName || "Coleção").replace(/\.(xlsx|xls)$/i, "").trim() || "Coleção";
      let html = "";
      if (!logged) {
        html = `<p class="fx-opt-note">💡 Entre na sua conta para salvar as cartas na nuvem e organizá-las em coleções. Sem login, elas ficam guardadas só neste navegador.</p>`;
      } else {
        if (multi) {
          html += `<p class="fx-opt-note">Identifiquei <b>${current.sheets.length} abas</b> nesta planilha. Quer que eu crie <b>uma coleção para cada aba</b>?</p>
            <label class="chk"><input type="checkbox" id="fxColEach" checked> Sim — uma coleção por aba (cada uma com o nome da aba)</label>`;
        } else {
          html += `<p class="fx-opt-note">Quer que eu organize estas cartas em uma <b>coleção</b>? Sugeri o nome do arquivo — você pode editar abaixo ou desmarcar para seguir sem coleção.</p>
            <label class="chk"><input type="checkbox" id="fxColOne" checked> Criar coleção chamada:</label>
            <input type="text" id="fxColName" class="fx-col-name" maxlength="80" value="${esc(baseName)}">`;
        }
        const cfg = window.ForgeSettings || {};
        if (vip && cfg.ai_art_enabled && cfg.ai_art_bulk_enabled) {
          const lim = cfg.ai_art_daily_limit != null ? cfg.ai_art_daily_limit : 3;
          html += `<label class="chk fx-art-opt"><input type="checkbox" id="fxArt"> ✨ Gerar arte por IA para as cartas marcadas
            <span class="hint">exclusivo VIP · limite de ${lim} arte(s) por dia · cada carta é gerada separadamente, pode demorar</span></label>`;
        }
      }
      box.innerHTML = html;
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

      const cloudWrap = $("fxCloudWrap");
      const wantsCloud = !cloudWrap.hidden && $("fxCloud") && $("fxCloud").checked && window.ForgeCloud && window.ForgeCloud.available;

      // ---------- caminho LOCAL (grátis, sem limite) ----------
      if (!wantsCloud) {
        const n = ForgeLocal.saveMany(chosen.map((x) => ({ data: x.c.data, meta: x.c.meta })));
        if (n) { T(`${n} carta(s) salvas neste navegador ✓`); refreshSavedCount(); }
        return;
      }

      // ---------- caminho NUVEM ----------
      const btn = $("fxSave"); btn.disabled = true;

      try {
        // 1) limite diário de criação (não-VIP)
        let remaining = Infinity;
        try { remaining = await window.ForgeCloud.remainingToday(); } catch (_) {}
        if (remaining <= 0) { btn.disabled = false; T(LIMIT_MSG, true); return; }
        let toSave = chosen;
        if (chosen.length > remaining) {
          if (!confirm(`Você só pode salvar mais ${remaining} carta(s) na nuvem nas próximas 24h (limite para não-VIP). Salvar as primeiras ${remaining} e parar?`)) { btn.disabled = false; return; }
          toSave = chosen.slice(0, remaining);
        }

        // quais cartas receberão arte por IA (VIP + checkbox; cap pelo limite configurado, servidor é a fonte da verdade)
        const wantArt = window.ForgeCloud.isVip && $("fxArt") && $("fxArt").checked;
        let artTargets = [];
        if (wantArt) {
          const dailyLimit = (window.ForgeSettings && window.ForgeSettings.ai_art_daily_limit) || 0;
          if (dailyLimit > 0) artTargets = toSave.filter((x) => !x.c.data.art).slice(0, dailyLimit);
        }

        const totalSteps = artTargets.length + toSave.length;
        let step = 0;

        Prog.open(wantArt ? "Salvando cartas (com arte por IA)…" : "Salvando cartas…");
        Prog.step(0, totalSteps);

        // 2) geração de arte por IA (uma de cada vez, com novas tentativas em instabilidade)
        if (wantArt) {
          if (!artTargets.length) {
            Prog.error(`Cota de arte por IA esgotada hoje (limite ${(window.ForgeSettings && window.ForgeSettings.ai_art_daily_limit) || 0}/dia). As cartas serão salvas sem arte gerada.`);
          }
          let interDelay = 1500; // espaçamento base; aumenta se a IA acusar instabilidade (5xx/rede)
          for (let i = 0; i < artTargets.length; i++) {
            const x = artTargets[i];
            const nm = x.c.data.name || "Sem nome";
            Prog.phase(`Gerando arte por IA ${i + 1}/${artTargets.length} — “${nm}” (pode demorar)`);
            try {
              const img = await generateArtRetry(x.c.data, x.c.meta, (att, wait, e) => {
                interDelay = Math.min(9000, interDelay + 1500);
                Prog.phase(`IA ocupada (${e.message}). Tentando de novo em ${Math.round(wait / 1000)}s… (${att}/3) — “${nm}”`);
              });
              x.c.data.art = img; renderReviewGrid();
            } catch (e) {
              const st = e.status || 0;
              Prog.error(`Arte de “${nm}”: ${e.message || "falha"}`);
              if (st === 401 || st === 403 || st === 429 || /vip|sess|login|api ?key|não configurada|exclusiv|limite|cota|desativad/i.test(e.message || "")) {
                Prog.error("Geração de arte interrompida (limite diário ou credencial). As demais cartas serão salvas sem arte.");
                break;
              }
              // erro transitório que esgotou as tentativas: pula esta carta e segue para a próxima
            }
            step++; Prog.step(step, totalSteps);
            await sleep(interDelay);
          }
          step = artTargets.length; Prog.step(step, totalSteps); // normaliza se parou no meio
        }

        // 3) coleções + salvar na nuvem
        const eachCol = $("fxColEach") && $("fxColEach").checked;            // multi-abas
        const oneCol = $("fxColOne") && $("fxColOne").checked;              // aba única
        const oneColName = ($("fxColName") && $("fxColName").value.trim()) ||
          String(current.fileName || "Coleção").replace(/\.(xlsx|xls)$/i, "");

        const bySheet = new Map();
        toSave.forEach((x) => {
          if (!bySheet.has(x.si)) bySheet.set(x.si, { name: current.sheets[x.si].name, items: [] });
          bySheet.get(x.si).items.push(x);
        });

        Prog.phase("Salvando na nuvem…");
        let saved = 0, hitLimit = false;
        for (const [, grp] of bySheet) {
          let colId = null;
          try {
            if (eachCol) colId = await window.ForgeCloud.createCollection(grp.name);
            else if (oneCol) colId = await window.ForgeCloud.createCollection(oneColName);
          } catch (e) { Prog.error(`Coleção “${grp.name}”: ${e.message || "falha ao criar"}`); }

          for (const x of grp.items) {
            Prog.phase(`Salvando na nuvem ${saved + 1}/${toSave.length} — “${x.c.data.name || "Sem nome"}”`);
            try {
              const id = await window.ForgeCloud.save(x.c.data);
              saved++;
              if (colId && id) { try { await window.ForgeCloud.addToCollection(colId, id); } catch (e2) { Prog.error(`Vincular “${x.c.data.name || "Sem nome"}” à coleção: ${e2.message || "falha"}`); } }
            } catch (e) {
              if (e.code === "LIMITE") { hitLimit = true; Prog.error(LIMIT_MSG); break; }
              if (e.code === "BANIDO") { hitLimit = true; Prog.error("Sua conta está suspensa e não pode salvar cartas."); break; }
              Prog.error(`Salvar “${x.c.data.name || "Sem nome"}”: ${e.message || "falha"}`);
            }
            step++; Prog.step(step, totalSteps);
          }
          if (hitLimit) break;
        }

        Prog.step(totalSteps, totalSteps);
        const colMsg = (eachCol || oneCol) ? " e organizada(s) em coleção(ões)" : "";
        Prog.done(saved ? `Concluído — ${saved} carta(s) salva(s)` : "Concluído — nada salvo");
        if (saved) {
          Prog.phase(`${saved} carta(s) salva(s) na sua conta${colMsg}.`);
          T(`${saved} carta(s) salva(s) na sua conta${colMsg} ✓`);
          refreshSavedCount();
        } else if (!hitLimit) {
          Prog.phase("Nenhuma carta foi salva — confira os avisos acima.");
        }
      } catch (e) {
        Prog.error("Erro inesperado: " + (e.message || e));
        Prog.done("Falhou");
      } finally {
        btn.disabled = false; updateSelCount();
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
