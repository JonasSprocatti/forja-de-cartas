/* ============================================================
   Forja de Cartas — lógica do frontend (multi-layout)
   ============================================================ */
const $ = (id) => document.getElementById(id);
const card = $("cardCanvas");

/* ---------- estado ---------- */
const state = {
  layout: "normal", color: "auto",
  name: "", mana: "", type: "", rules: "", flavor: "", pt: "",
  rarity: "incomum", artist: "você", collector: "001/250",
  setIcon: "", setIconTints: null,
  art: "", backArt: "",
  loyalty: "4", defense: "5",
  pw: [], saga: [], cls: [],
  adv: { name:"", mana:"", type:"", rules:"" },
  split: { name:"", mana:"", type:"", rules:"" },
  back: { name:"", mana:"", type:"", rules:"", flavor:"", pt:"" },
  showBack: false, frame: "auto", style: "modern", foil: false, frameEdit: null, overlays: [],
};
const FRAMES={};
const MANA={};  /* símbolos de mana customizados, carregados de assets/mana/mana.json */
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- utilidades de render ---------- */
function escapeHTML(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
const PIP_COLORS={W:"#ece3c8",U:"#3f8fd0",B:"#4a443c",R:"#c8543a",G:"#3f9a55",C:"#b8b0a0",N:"#b8b0a0"};
function halfCls(x){return /^\d+$/.test(x)?"N":(["W","U","B","R","G","C"].includes(x)?x:"N");}
/* gera UM pip a partir de um código (W, 2, T, X, W/U, 2/W, W/P, S, E…) */
function pipSpan(raw,shadow){
  const code=(raw||"").trim().toUpperCase();
  if(code==="") return "";
  const cm=MANA[code];
  if(cm) return cm.src
    ? `<span class="pip pip-img"><img src="${(shadow&&MANA_SHADOW[code])||cm.src}" alt="${escapeHTML(code)}"></span>`
    : `<span class="pip pip-N"${cm.color?` style="background:${cm.color};color:${cm.textColor||'#1c160c'}"`:""}>${escapeHTML(cm.text||code)}</span>`;
  if(/^\d+$/.test(code)) return `<span class="pip pip-N">${code}</span>`;
  if(["X","Y","Z"].includes(code)) return `<span class="pip pip-N">${code}</span>`;
  if(code==="T") return `<span class="pip pip-tap" title="vire">↻</span>`;
  if(code==="Q") return `<span class="pip pip-tap" title="desvire">↺</span>`;
  if(code==="E") return `<span class="pip pip-E" title="energia">⚡</span>`;
  if(code==="S") return `<span class="pip pip-C">❄</span>`;
  if(code==="C") return `<span class="pip pip-C">C</span>`;
  if(code==="P") return `<span class="pip pip-phy" title="phyrexiano">Φ</span>`;
  if(["W","U","B","R","G"].includes(code)) return `<span class="pip pip-${code}">${code}</span>`;
  if(code.includes("/")){
    const [a,b]=code.split("/");
    if(b==="P") return `<span class="pip pip-phy" title="phyrexiano">${escapeHTML(a)}</span>`;
    const ca=PIP_COLORS[halfCls(a)],cb=PIP_COLORS[halfCls(b)];
    return `<span class="pip pip-hybrid" style="background:linear-gradient(135deg,${ca} 0 48%,${cb} 52% 100%)" title="híbrido">${escapeHTML(a+b)}</span>`;
  }
  return `<span class="pip pip-N">${escapeHTML(code)}</span>`;
}
/* custo de mana: aceita "2WU", "{2}{W}{U}" e MISTURA "2{R/G}{R/G}" */
function pips(str,shadow){
  const raw=(str||"").trim(); if(!raw) return "";
  const out=[]; let i=0;
  while(i<raw.length){
    const ch=raw[i];
    if(ch==="{"){
      const j=raw.indexOf("}",i);
      if(j<0){ break; }                 // chave não fechada: para
      out.push(pipSpan(raw.slice(i+1,j),shadow)); i=j+1;
    } else if(/\s/.test(ch)){ i++; }
    else if(/\d/.test(ch)){                // número de 1+ dígitos = mana genérica
      let n=ch; i++; while(i<raw.length&&/\d/.test(raw[i])){ n+=raw[i]; i++; }
      out.push(pipSpan(n,shadow)); 
    } else { out.push(pipSpan(ch.toUpperCase(),shadow)); i++; }
  }
  return out.join("");
}
/* ===== SOMBRA "ASSADA" NOS SÍMBOLOS DO CUSTO =====
   CSS drop-shadow em pips de ~21px é sub-pixel (o contorno some no
   anti-aliasing) e o html-to-image renderiza filter de forma inconsistente
   na exportação. Solução definitiva: pré-compor a sombra nos PIXELS via
   canvas — um disco preto sólido (o próprio símbolo tingido) deslocado
   p/ baixo-esquerda, com o símbolo por cima. Fica idêntico na prévia,
   no PNG exportado e na folha de impressão. */
const MANA_SHADOW={};   // code -> dataURL com a sombra embutida
/* configuração da sombra do custo — calibre nos sliders do editor
   ("Calibrar sombra do custo") e depois fixe os valores aqui.
   dx/dy em % do símbolo (dx − = esquerda, dy + = baixo); alpha 0–1. */
const MANA_SHADOW_CFG={ dx:-8, dy:8, alpha:1 };
try{ Object.assign(MANA_SHADOW_CFG, JSON.parse(localStorage.getItem("forja_shadow_cfg")||"{}")); }catch(_){}
async function buildManaShadows(){
  const entries=Object.entries(MANA).filter(([,v])=>v&&v.src);
  await Promise.all(entries.map(([code,v])=>new Promise(res=>{
    const im=new Image();
    im.onload=()=>{
      try{
        /* o canvas precisa conter o SÍMBOLO + a SOMBRA deslocada, senão o
           disco é cortado reto na borda: margem = |offset| + 1px de folga */
        const k=96;
        const ox=Math.round(k*(MANA_SHADOW_CFG.dx||0)/100);
        const oy=Math.round(k*(MANA_SHADOW_CFG.dy||0)/100);
        const pad=Math.max(Math.abs(ox),Math.abs(oy))+1, S=k+pad*2;
        const c=document.createElement("canvas"); c.width=S; c.height=S;
        const x=c.getContext("2d");
        x.drawImage(im, pad+ox, pad+oy, k, k);               // cópia deslocada…
        x.globalCompositeOperation="source-in";
        x.fillStyle=`rgba(0,0,0,${MANA_SHADOW_CFG.alpha??1})`;
        x.fillRect(0,0,S,S);                                 // …tingida de preto = a sombra
        x.globalCompositeOperation="source-over";
        x.drawImage(im, pad, pad, k, k);                     // símbolo por cima
        MANA_SHADOW[code]=c.toDataURL("image/png");
      }catch(_){ /* SVG problemático: segue sem sombra p/ esse código */ }
      res();
    };
    im.onerror=()=>res();
    im.src=v.src;
  })));
}
/* sliders de calibração: regeneram a sombra ao vivo e guardam a escolha */
(function wireShadowCal(){
  const dx=$("shadowDx"), dy=$("shadowDy"), al=$("shadowAlpha"), out=$("shadowVals");
  if(!dx||!dy||!al) return;   // painel ausente nesta página
  dx.value=MANA_SHADOW_CFG.dx; dy.value=MANA_SHADOW_CFG.dy; al.value=Math.round((MANA_SHADOW_CFG.alpha??1)*100);
  const show=()=>{ if(out) out.textContent=`valores atuais → dx: ${MANA_SHADOW_CFG.dx} · dy: ${MANA_SHADOW_CFG.dy} · opacidade: ${Math.round((MANA_SHADOW_CFG.alpha??1)*100)}%`; };
  show();
  let t=null;
  const upd=()=>{
    MANA_SHADOW_CFG.dx=parseInt(dx.value,10); MANA_SHADOW_CFG.dy=parseInt(dy.value,10);
    MANA_SHADOW_CFG.alpha=parseInt(al.value,10)/100;
    try{ localStorage.setItem("forja_shadow_cfg",JSON.stringify(MANA_SHADOW_CFG)); }catch(_){}
    show();
    clearTimeout(t); t=setTimeout(()=>{ buildManaShadows().then(()=>render()); },160);
  };
  [dx,dy,al].forEach(el=>el.addEventListener("input",upd));
})();
function autoColor(mana){
  const c=[...new Set((mana.toUpperCase().match(/[WUBRG]/g))||[])];
  if(c.length===0) return "C"; if(c.length===1) return c[0]; return "multi";
}
/* ============================================================
   DETECÇÃO AUTOMÁTICA DE FRAME — tipo, supertipo e cor
   Os catálogos oficiais de tipos vêm da API do Scryfall
   (/catalog/supertypes, /catalog/card-types, /catalog/artifact-types,
   /catalog/creature-types) e ficam em cache no localStorage por 7 dias.
   ============================================================ */
const SCRY_TYPES={ supertypes:[], cardTypes:[], artifactTypes:[], creatureTypes:[] };
/* dicionário PT-BR -> inglês (a linha de tipo pode ser escrita em português) */
const TYPE_PT2EN={
  // supertipos
  "lendario":"legendary","lendaria":"legendary","basico":"basic","basica":"basic",
  "neve":"snow","mundo":"world","continuo":"ongoing","continua":"ongoing",
  // tipos de carta
  "criatura":"creature","artefato":"artifact","encantamento":"enchantment",
  "instantaneo":"instant","instantanea":"instant","magica":"instant",
  "feitico":"sorcery","terreno":"land","planeswalker":"planeswalker",
  "batalha":"battle","tribal":"kindred","conspiracao":"conspiracy",
  "ficha":"token","emblema":"emblem","masmorra":"dungeon","aventura":"adventure",
  // subtipos com frame próprio
  "veiculo":"vehicle","equipamento":"equipment","saga":"saga","classe":"class",
  "aura":"aura","eldrazi":"eldrazi",
};
function normTypeWord(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
}
/* quebra a linha de tipo em palavras normalizadas e traduzidas para inglês */
function parseTypeLine(typeLine){
  const raw=(typeLine||"");
  const parts=raw.split(/—|–|\s-\s/);
  const left=parts[0]||"", right=parts.slice(1).join(" ")||"";
  const tok=side=>side.split(/[\s,/]+/).map(normTypeWord).filter(Boolean).map(w=>TYPE_PT2EN[w]||w);
  const leftW=new Set(tok(left)), rightW=new Set(tok(right));
  const has=(set,w)=>set.has(w);
  const inCatalog=(list,w)=>list.some(t=>normTypeWord(t)===w);
  const supertypes=new Set(), types=new Set();
  leftW.forEach(w=>{
    if(["legendary","basic","snow","world","ongoing"].includes(w) || inCatalog(SCRY_TYPES.supertypes,w)) supertypes.add(w);
    else if(["creature","artifact","enchantment","instant","sorcery","land","planeswalker","battle","kindred","tribal","token","emblem"].includes(w) || inCatalog(SCRY_TYPES.cardTypes,w)) types.add(w);
  });
  return {
    supertypes, types, subtypes:rightW,
    legendary: has(supertypes,"legendary"),
    vehicle: has(rightW,"vehicle") || has(leftW,"vehicle"),
    eldrazi: has(rightW,"eldrazi") || has(leftW,"eldrazi"),
  };
}
/* carrega os catálogos de tipos do Scryfall (com cache local de 7 dias) */
async function loadScryTypes(){
  const KEY="forja_scry_types_v1", TTL=7*24*60*60*1000;
  try{
    const cached=JSON.parse(localStorage.getItem(KEY)||"null");
    if(cached && cached.at && (Date.now()-cached.at)<TTL && cached.data){
      Object.assign(SCRY_TYPES,cached.data); return;
    }
  }catch(_){}
  const endpoints={
    supertypes:"https://api.scryfall.com/catalog/supertypes",
    cardTypes:"https://api.scryfall.com/catalog/card-types",
    artifactTypes:"https://api.scryfall.com/catalog/artifact-types",
    creatureTypes:"https://api.scryfall.com/catalog/creature-types",
  };
  try{
    await Promise.all(Object.entries(endpoints).map(async([k,url])=>{
      const r=await fetch(url); if(!r.ok) return;
      const j=await r.json(); if(Array.isArray(j.data)) SCRY_TYPES[k]=j.data;
    }));
    localStorage.setItem(KEY,JSON.stringify({at:Date.now(),data:SCRY_TYPES}));
  }catch(_){ /* offline: segue com o dicionário embutido */ }
}
/* prefixo de frame por identidade de cor (usado quando nenhuma regra de tipo casa) */
const FRAME_PREFIX={W:"W",U:"U",B:"B",R:"R",G:"G",multi:"Golden",C:"C"};
/* "KIND" do frame por layout do editor — quando você subir PNGs novos com esses
   nomes, eles passam a ser aplicados automaticamente. Convenção de nome:
   {PREFIXO}-{KIND}[-Legendary][-PR]  ex.: W-Planeswalker, Golden-Saga-Legendary,
   R-Battle, U-DFC-Front, B-Adventure-PR. Um PNG sem prefixo de cor (ex.:
   "Planeswalker.png" com id "Planeswalker") vale para todas as cores. */
const LAYOUT_FRAME_KIND={
  planeswalker:"Planeswalker", saga:"Saga", class:"Class", battle:"Battle",
  adventure:"Adventure", token:"Token", emblem:"Emblem", split:"Split", land:"Land",
};
/* subtipos que também podem ter moldura própria, se o PNG existir */
const SUBTYPE_FRAME_KIND=[
  ["vehicle","V",true],      // já existe como prefixo V hoje
  ["equipment","Equipment"], ["aura","Aura"], ["room","Room"], ["omen","Omen"],
];
/* escolhe o id do frame automaticamente:
   1) regras "match" declaradas no frames.json (mais específicas vencem)
   2) convenção de nome por layout/subtipo/cor + variantes Legendary/PR */
function autoFrame(){
  if(!Object.keys(FRAMES).length) return "";   // frames não carregados (file://)
  const backFace = state.layout==="dfc" && state.showBack;
  const mana = backFace ? (state.back.mana||state.mana) : state.mana;   // verso sem custo herda a cor da frente
  const type = (backFace ? state.back.type : state.type) || state.type || "";
  const pt   = (backFace ? state.back.pt   : state.pt)   || "";
  const info = parseTypeLine(type);
  const color=(state.color && state.color!=="auto") ? state.color : autoColor(mana||"");
  const legendary=info.legendary, hasPT=(pt||"").trim()!=="";
  const ctx={layout:state.layout,color,legendary,pt:hasPT,face:backFace?"back":"front",typeInfo:info,typeRaw:type};

  /* --- 1) regras explícitas ("match") no frames.json --- */
  const byMatch=frameByMatch(ctx);
  if(byMatch) return byMatch;

  /* --- 2) convenção de nomes --- */
  /* KINDs candidatos, do mais específico ao mais genérico */
  const kinds=[];
  if(state.layout==="dfc"){ kinds.push(backFace?"DFC-Back":"DFC-Front","DFC"); }
  else if(LAYOUT_FRAME_KIND[state.layout]) kinds.push(LAYOUT_FRAME_KIND[state.layout]);
  if(info.types.has("land") && !kinds.includes("Land")) kinds.push("Land");
  for(const [sub,kind,isPrefix] of SUBTYPE_FRAME_KIND){
    if(info.subtypes.has(sub)||info.types.has(sub)){ if(!isPrefix) kinds.push(kind); }
  }
  kinds.push(null);   // null = molduras clássicas (Basic/Legendary)

  /* prefixos candidatos: subtipo com prefixo próprio > cor > fallbacks */
  const prefixes=[];
  if(info.vehicle) prefixes.push("V");
  if(info.eldrazi) prefixes.push("E");
  prefixes.push(FRAME_PREFIX[color]||"Golden");
  if(color==="C") prefixes.push("E");           // incolor sem frame C -> Eldrazi
  prefixes.push("Golden");

  const variantsFor=k=>{
    const base=k?`-${k}`:"";
    const v=[];
    if(k){
      if(legendary&&hasPT) v.push(`${base}-Legendary-PR`);
      if(legendary)        v.push(`${base}-Legendary`);
      if(hasPT)            v.push(`${base}-PR`,`${base}-PR Counter`);
      v.push(base);
    }else{
      if(legendary&&hasPT) v.push("-Legendary-PR");
      if(legendary)        v.push("-Legendary");
      if(hasPT)            v.push("-Basic-PR Counter","-Basic-PR");
      v.push("-Basic");
    }
    return v;
  };
  for(const k of kinds){
    for(const p of prefixes){
      for(const v of variantsFor(k)){ const id=`${p}${v}`; if(FRAMES[id]) return id; }
    }
    if(k && FRAMES[k]) return k;   // frame genérico do layout, sem cor (ex.: "Planeswalker")
  }
  const p0=prefixes[0];
  const any=Object.keys(FRAMES).find(id=>id.startsWith(p0+"-"));
  return any || (FRAMES["Golden-Basic"]?"Golden-Basic":Object.keys(FRAMES)[0]||"");
}
/* avalia as regras "match" opcionais declaradas em frames.json. Campos aceitos:
   layout: "planeswalker" ou ["saga","class"]      colors: ["W","U","multi","C"]
   legendary: true/false      pt: true/false       face: "front"|"back"
   typeIncludes: ["dragão","eldrazi"] (sem acento, qualquer parte da linha de tipo)
   Todos os campos declarados precisam bater; vence o frame com mais campos. */
function frameByMatch(ctx){
  let best=null,bestScore=-1;
  const typeNorm=normTypeWord(ctx.typeRaw);
  for(const id of Object.keys(FRAMES)){
    const m=FRAMES[id].match; if(!m) continue;
    let score=0,ok=true;
    const arr=x=>Array.isArray(x)?x:[x];
    if(m.layout!=null){ if(!arr(m.layout).includes(ctx.layout)){ok=false;} else score++; }
    if(ok&&m.colors!=null){ if(!arr(m.colors).includes(ctx.color)){ok=false;} else score++; }
    if(ok&&m.legendary!=null){ if(m.legendary!==ctx.legendary){ok=false;} else score++; }
    if(ok&&m.pt!=null){ if(m.pt!==ctx.pt){ok=false;} else score++; }
    if(ok&&m.face!=null){ if(m.face!==ctx.face){ok=false;} else score++; }
    if(ok&&m.typeIncludes!=null){
      const hit=arr(m.typeIncludes).some(t=>typeNorm.includes(normTypeWord(t)));
      if(!hit){ok=false;} else score++;
    }
    if(ok&&score>bestScore){ best=id; bestScore=score; }
  }
  return best;
}
/* resolve o frame efetivo: sempre um PNG da pasta /assets/frames.
   "auto", vazio ou id inexistente -> detecção automática. */
function resolveFrame(){
  const f=state.frame;
  if(!f || f==="auto" || !FRAMES[f]) return autoFrame();
  return f;
}
/* texto de regras: parênteses viram lembrete (primeiro!), depois {…} viram pips */
function rulesHTML(text){
  let h=escapeHTML(text);
  h=h.replace(/\(([^)]+)\)/g,'<span class="reminder">($1)</span>');
  h=h.replace(/\{([^}]+)\}/g,(_,code)=>pipSpan(code));
  return h;
}
const SYM={comum:"●",incomum:"◆",rara:"★","mítica":"✦"};
/* ---- ÍCONE DE RARIDADE ENVIADO (PNG) ----
   O PNG vira uma "máscara" (alpha) e é preenchido com a cor/gradiente
   padrão de cada raridade — igual ao símbolo de coleção do MTG. */
const RARITY_TINT={
  comum:   { solid:"#16130e" },
  incomum: { grad:["#dfe6ec","#8d99a6","#4e5761"] },   // prata
  rara:    { grad:["#f3dd9a","#c8a44e","#8a6a1f"] },   // dourado
  "mítica":{ grad:["#fcc667","#f07822","#c1361b"] },   // laranja-fogo
};
function tintIconCanvas(img,rarity){
  const c=document.createElement("canvas");
  c.width=img.naturalWidth||img.width; c.height=img.naturalHeight||img.height;
  const x=c.getContext("2d");
  x.drawImage(img,0,0);
  x.globalCompositeOperation="source-in";     // mantém o alpha, troca a cor
  const t=RARITY_TINT[rarity]||RARITY_TINT.incomum;
  if(t.grad){
    const g=x.createLinearGradient(0,0,0,c.height);
    g.addColorStop(0,t.grad[0]); g.addColorStop(.55,t.grad[1]); g.addColorStop(1,t.grad[2]);
    x.fillStyle=g;
  } else x.fillStyle=t.solid;
  x.fillRect(0,0,c.width,c.height);
  return c.toDataURL("image/png");
}
/* gera as 4 versões recoloridas de uma vez (armazenadas na carta) */
function buildSetIconTints(src){
  return new Promise((res,rej)=>{
    const img=new Image();
    img.onload=()=>{ const out={}; Object.keys(RARITY_TINT).forEach(r=>out[r]=tintIconCanvas(img,r)); res(out); };
    img.onerror=rej; img.src=src;
  });
}
function setSym(r){
  const t=state.setIconTints;
  if(t && t[r]) return `<span class="c-set r-${r}"><img class="set-ico" src="${t[r]}" alt=""></span>`;
  return `<span class="c-set r-${r}">${SYM[r]||"◆"}</span>`;
}
function credit(){const a=escapeHTML(state.artist.trim()||"—");const c=escapeHTML(state.collector.trim());return `illus. ${a}${c?" · "+c:""}`;}

/* peças reutilizáveis */
function elArt(url,cls){
  if(url) return `<div class="art-window ${cls||""}"><img src="${url}" alt=""></div>`;
  return `<div class="art-window ${cls||""}"><div class="art-ph"><span class="art-ph-ico">⛰</span><span class="art-ph-txt">sua arte aqui</span></div></div>`;
}
function titleBar(name,mana){
  return `<div class="title-bar"><span class="c-name">${escapeHTML(name||"Sem nome")}</span><span class="c-mana">${pips(mana,true)}</span></div>`;
}
function typeBar(type,rarity){
  return `<div class="type-bar"><span class="c-type">${escapeHTML(type||"—")}</span>${setSym(rarity)}</div>`;
}
function textBox(rules,flavor){
  const f=(flavor||"").trim();
  return `<div class="text-box"><div class="c-rules">${rulesHTML(rules)}</div>${f?`<div class="c-flavor">${escapeHTML(f)}</div>`:""}</div>`;
}
function bottomBar(pt){
  return `<div class="bottom-bar"><span class="c-credit">${credit()}</span>${pt&&pt.trim()?`<span class="c-pt">${escapeHTML(pt.trim())}</span>`:""}</div>`;
}

/* ============================================================
   RENDERIZADORES POR LAYOUT
   ============================================================ */
function renderFullArt(d){
  const f=(d.flavor||"").trim();
  return `<div class="card-frame fa">
    <div class="fa-art${d.art?"":" fa-noart"}">${d.art?`<img src="${d.art}" alt="">`:`<div class="art-ph"><span class="art-ph-ico">⛰</span><span class="art-ph-txt">sua arte aqui</span></div>`}</div>
    <div class="fa-top">
      <span class="c-name">${escapeHTML(d.name||"Sem nome")}</span>
      <span class="c-mana">${pips(d.mana,true)}</span>
    </div>
    <div class="fa-bottom">
      <div class="fa-type"><span class="c-type">${escapeHTML(d.type||"—")}</span>${setSym(d.rarity)}</div>
      <div class="fa-text"><div class="c-rules">${rulesHTML(d.rules)}</div>${f?`<div class="c-flavor">${escapeHTML(f)}</div>`:""}</div>
      <div class="bottom-bar"><span class="c-credit">${credit()}</span>${d.pt&&d.pt.trim()?`<span class="c-pt">${escapeHTML(d.pt.trim())}</span>`:""}</div>
    </div>
  </div>`;
}
function renderNormal(d){ // criatura/mágica/artefato/encantamento/token/dfc-face
  if(state.style==="fullart") return renderFullArt(d);
  return `<div class="card-frame">
    ${titleBar(d.name,d.mana)}
    ${elArt(d.art)}
    ${typeBar(d.type,d.rarity)}
    ${textBox(d.rules,d.flavor)}
    ${bottomBar(d.pt)}
  </div>`;
}
function renderLand(){
  return `<div class="card-frame">
    <div class="title-bar"><span class="c-name">${escapeHTML(state.name||"Sem nome")}</span></div>
    ${elArt(state.art)}
    ${typeBar(state.type,state.rarity)}
    ${textBox(state.rules,state.flavor)}
    ${bottomBar(state.pt)}
  </div>`;
}
function renderToken(){
  if(state.style==="fullart") return renderFullArt({name:state.name,mana:state.mana,type:state.type||"Ficha",rules:state.rules,flavor:state.flavor,pt:state.pt,art:state.art,rarity:state.rarity});
  return `<div class="card-frame token">
    <div class="title-bar"><span class="c-name">${escapeHTML(state.name||"Sem nome")}</span><span class="c-mana">${pips(state.mana,true)}</span></div>
    ${elArt(state.art,"art-tall")}
    ${typeBar(state.type||"Ficha",state.rarity)}
    ${state.rules.trim()?textBox(state.rules,state.flavor):`<div class="text-box mini">${state.flavor?`<div class="c-flavor">${escapeHTML(state.flavor)}</div>`:""}</div>`}
    ${bottomBar(state.pt)}
  </div>`;
}
function renderPlaneswalker(){
  const abil=state.pw.map(a=>`<div class="pw-row"><span class="pw-cost">${escapeHTML(a.cost||"")}</span><span class="pw-text">${rulesHTML(a.text)}</span></div>`).join("");
  return `<div class="card-frame pw">
    ${titleBar(state.name,state.mana)}
    ${elArt(state.art,"art-short")}
    ${typeBar(state.type||"Planeswalker",state.rarity)}
    <div class="pw-abilities">${abil}</div>
    <div class="bottom-bar"><span class="c-credit">${credit()}</span><span class="pw-loyalty">${escapeHTML(state.loyalty||"")}</span></div>
  </div>`;
}
function renderSaga(){
  const ch=state.saga.map(c=>`<div class="saga-chapter"><span class="saga-num">${escapeHTML(c.num||"")}</span><span class="saga-text">${rulesHTML(c.text)}</span></div>`).join("");
  return `<div class="card-frame saga">
    ${titleBar(state.name,state.mana)}
    <div class="saga-body">
      <div class="saga-chapters">${ch}</div>
      <div class="saga-art">${state.art?`<img src="${state.art}" alt="">`:`<div class="art-ph"><span>⛰</span></div>`}</div>
    </div>
    ${typeBar(state.type||"Encantamento — Saga",state.rarity)}
    ${bottomBar("")}
  </div>`;
}
function renderClass(){
  const lv=state.cls.map((l,i)=>{
    const head=i===0?`<div class="class-base">${escapeHTML(l.label||"Base")}</div>`
      :`<div class="class-levelbar"><span>${escapeHTML(l.label||("Nível "+(i+1)))}</span>${l.cost?`<span class="class-cost">${pips(l.cost)}</span>`:""}</div>`;
    return `${head}<div class="class-text">${rulesHTML(l.text)}</div>`;
  }).join("");
  return `<div class="card-frame class">
    ${titleBar(state.name,state.mana)}
    ${elArt(state.art,"art-short")}
    ${typeBar(state.type||"Encantamento — Classe",state.rarity)}
    <div class="class-levels">${lv}</div>
    ${bottomBar("")}
  </div>`;
}
function renderBattle(){
  return `<div class="card-frame battle">
    ${titleBar(state.name,state.mana)}
    ${elArt(state.art,"art-wide")}
    ${typeBar(state.type||"Batalha — Siege",state.rarity)}
    ${textBox(state.rules,state.flavor)}
    <div class="bottom-bar"><span class="c-credit">${credit()}</span><span class="battle-def">${escapeHTML(state.defense||"")}</span></div>
  </div>`;
}
function renderAdventure(){
  const a=state.adv;
  const advBox=`<div class="adv-box">
      <div class="adv-title"><span class="adv-name">${escapeHTML(a.name||"Aventura")}</span><span class="c-mana">${pips(a.mana,true)}</span></div>
      <div class="adv-type">${escapeHTML(a.type||"Instantâneo — Aventura")}</div>
      <div class="adv-rules">${rulesHTML(a.rules)}</div>
    </div>`;
  return `<div class="card-frame">
    ${titleBar(state.name,state.mana)}
    ${elArt(state.art,"art-short")}
    ${typeBar(state.type,state.rarity)}
    <div class="text-box">${advBox}<div class="c-rules">${rulesHTML(state.rules)}</div>${state.flavor.trim()?`<div class="c-flavor">${escapeHTML(state.flavor)}</div>`:""}</div>
    ${bottomBar(state.pt)}
  </div>`;
}
function renderEmblem(){
  return `<div class="card-frame emblem">
    <div class="emblem-glyph">✦</div>
    <div class="emblem-title">Emblema</div>
    <div class="emblem-sub">${escapeHTML(state.name||"")}</div>
    <div class="emblem-text">${rulesHTML(state.rules)}</div>
    <div class="emblem-credit">${escapeHTML(state.artist?("— "+state.artist):"")}</div>
  </div>`;
}
function renderDFC(){
  const f = state.showBack
    ? {name:state.back.name,mana:state.back.mana,type:state.back.type,rules:state.back.rules,flavor:state.back.flavor,pt:state.back.pt,art:state.backArt,rarity:state.rarity}
    : {name:state.name,mana:state.mana,type:state.type,rules:state.rules,flavor:state.flavor,pt:state.pt,art:state.art,rarity:state.rarity};
  const html=renderNormal(f);
  const ind=`<div class="dfc-ind" title="transforma">${state.showBack?"◑":"◐"}</div>`;
  return html.replace('<div class="card-frame">',`<div class="card-frame">${ind}`);
}
function renderSplit(){
  const left=`<div class="split-half">
      <div class="title-bar"><span class="c-name">${escapeHTML(state.name||"")}</span><span class="c-mana">${pips(state.mana,true)}</span></div>
      <div class="type-bar"><span class="c-type">${escapeHTML(state.type||"")}</span></div>
      <div class="text-box"><div class="c-rules">${rulesHTML(state.rules)}</div></div>
    </div>`;
  const s=state.split;
  const right=`<div class="split-half">
      <div class="title-bar"><span class="c-name">${escapeHTML(s.name||"")}</span><span class="c-mana">${pips(s.mana,true)}</span></div>
      <div class="type-bar"><span class="c-type">${escapeHTML(s.type||"")}</span></div>
      <div class="text-box"><div class="c-rules">${rulesHTML(s.rules)}</div></div>
    </div>`;
  return `<div class="card-frame split">${left}<div class="split-div"></div>${right}</div>`;
}

const RENDERERS={normal:()=>renderNormal({name:state.name,mana:state.mana,type:state.type,rules:state.rules,flavor:state.flavor,pt:state.pt,art:state.art,rarity:state.rarity}),
  land:renderLand,token:renderToken,planeswalker:renderPlaneswalker,saga:renderSaga,
  class:renderClass,battle:renderBattle,adventure:renderAdventure,emblem:renderEmblem,dfc:renderDFC,split:renderSplit};

/* ---------- FRAME PERSONALIZADO (pasta /assets/frames) ---------- */
function cfFont(f){
  /* fontes por zona, no padrão das cartas originais:
     nome / tipo / P&R -> Beleren Bold (a fonte oficial dessas áreas)
     texto de regras   -> serifa REGULAR (as originais usam MPlantin; Spectral é
                          o substituto livre mais próximo — Beleren Bold aqui fica errado)
     crédito / rodapé  -> Beleren SmallCaps
     ATENÇÃO: aspas SIMPLES nos nomes — esse valor entra num atributo style="…"
     e aspas duplas quebrariam o HTML. */
  if(f==="body")   return "'Spectral','EB Garamond',Georgia,serif";
  if(f==="credit") return "'Beleren SmallCaps','Beleren Bold','Cinzel',serif";
  if(f==="pt")     return "'Beleren Bold','Bitter',serif";
  return "'Beleren Bold','Cinzel',serif";
}
function zoneBox(z){return `left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%;`;}
function zone(z,inner,top,key){
  const al=z.align||"left";
  const items=al==="center"?"center":al==="right"?"flex-end":"flex-start";
  const just=top?"flex-start":"center";
  // piso mínimo de fonte por zona (pode ser sobrescrito com "min" no frames.json)
  const floor = z.min!=null ? z.min : (key==="text"?9 : key==="name"?13 : key==="type"?11 : key==="pt"?12 : 8);
  // marca a zona para o auto-ajuste de fonte (exceto a zona de mana, que são pips)
  const fit = (key && key!=="mana") ? ` data-fit="1" data-zone="${key}" data-maxsize="${z.size||18}" data-minsize="${floor}"` : "";
  return `<div class="cf-zone"${fit} style="${zoneBox(z)}align-items:${items};justify-content:${just};text-align:${al};color:${z.color||"#1c160c"};font-family:${cfFont(key==="credit"?"credit":z.font)};font-size:${z.size||18}px;">${inner}</div>`;
}
/* conteúdo da zona de texto conforme o layout */
function cfTextContent(){
  if(state.layout==="planeswalker")
    return state.pw.map(a=>`<div class="cf-pwrow"><span class="cf-pwcost">${escapeHTML(a.cost||"")}</span><span>${rulesHTML(a.text)}</span></div>`).join("");
  if(state.layout==="saga")
    return state.saga.map(c=>`<div class="cf-pwrow"><span class="cf-num">${escapeHTML(c.num||"")}</span><span>${rulesHTML(c.text)}</span></div>`).join("");
  if(state.layout==="class")
    return state.cls.map((l,i)=>`<div class="cf-lvl"><b>${escapeHTML(l.label||"")}</b>${l.cost?" "+pips(l.cost):""}<div>${rulesHTML(l.text)}</div></div>`).join("");
  /* cada linha do texto vira um parágrafo com respiro — como nas cartas
     originais, que separam as habilidades com um pequeno espaço vertical */
  const paras=(state.rules||"").split(/\n/).map(l=>l.trim())
    .filter(l=>l!=="").map(l=>`<div class="cf-para">${rulesHTML(l)}</div>`).join("");
  let t=`<div class="cf-rules">${paras}</div>`;
  if(state.flavor.trim()){
    if(state.rules.trim()) t+=`<div class="cf-flavor-sep"></div>`;   // linha separadora rules ↔ flavor
    t+=`<div class="cf-flavor">${escapeHTML(state.flavor)}</div>`;
  }
  return t;
}
function renderCustomFrame(def,zonesArg){
  const Z=zonesArg||def.zones||{}; let h=`<div class="cf-root">`;
  if(Z.art) h+=`<div class="cf-art" style="${zoneBox(Z.art)}">${state.art?`<img src="${state.art}" alt="">`:`<div class="art-ph"><span>⛰</span></div>`}</div>`;
  h+=`<img class="cf-frame" src="${def.src}" alt="">`;
  if(Z.name) h+=zone(Z.name,escapeHTML(state.name||""),false,"name");
  if(Z.mana) h+=zone(Z.mana,`<div class="c-mana">${pips(state.mana,true)}</div>`,false,"mana");
  if(Z.type) h+=zone(Z.type,escapeHTML(state.type||""),false,"type");
  /* ícone de raridade enviado: usa a zona "rarity" do frames.json, ou um
     encaixe padrão na ponta direita da barra de tipo */
  /* ícone de coleção: usa a zona "rarity" do frames.json (editável nos
     sliders), ou um encaixe padrão na ponta direita da barra de tipo.
     Sem ícone enviado, mostra o símbolo padrão na cor da raridade. */
  {
    const R=Z.rarity||{x:85,y:(Z.type?Z.type.y-0.2:56.5),w:7.5,h:(Z.type?Z.type.h+0.6:5)};
    const tinted=state.setIconTints && state.setIconTints[state.rarity];
    const inner = tinted
      ? `<img src="${tinted}" alt="">`
      : `<span class="cf-rsym cf-r-${state.rarity}" style="font-size:${Math.round((R.h||5)*5.4)}px">${SYM[state.rarity]||"◆"}</span>`;
    h+=`<div class="cf-zone cf-rarity" style="${zoneBox(R)}align-items:center;justify-content:flex-end;">${inner}</div>`;
  }
  if(Z.text) h+=zone(Z.text,cfTextContent(),true,"text");
  if(Z.pt && state.pt.trim()) h+=zone(Z.pt,escapeHTML(state.pt),false,"pt");
  if(Z.loyalty && state.layout==="planeswalker") h+=zone(Z.loyalty,escapeHTML(state.loyalty),false,"loyalty");
  if(Z.defense && state.layout==="battle") h+=zone(Z.defense,escapeHTML(state.defense),false,"defense");
  if(Z.credit) h+=zone(Z.credit,credit(),false,"credit");
  return h+`</div>`;
}

function overlaysHTML(which){
  const list=(state.overlays||[]).filter(o=>(o.layer||"front")===which);
  if(!list.length) return "";
  return `<div class="ov-layer ov-${which}">`+list.map(o=>
    `<img class="ov-img" src="${o.src}" alt="" style="left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%;opacity:${(o.opacity==null?100:o.opacity)/100}">`
  ).join("")+`</div>`;
}
function applyOverlays(host){
  const root=host.querySelector(".card-frame, .cf-root");
  const back=overlaysHTML("back");
  if(back){ (root||host).insertAdjacentHTML("beforeend", back); }
  const front=overlaysHTML("front");
  if(front){ host.insertAdjacentHTML("beforeend", front); }
}
function render(){
  let col=state.color; if(col==="auto") col=autoColor(state.layout==="dfc"&&state.showBack?state.back.mana:state.mana);
  card.dataset.color=col; card.dataset.layout=state.layout;
  card.dataset.style=state.style; card.dataset.foil=state.foil?"true":"false";
  let inner;
  const frameId=resolveFrame();
  if(frameId && FRAMES[frameId]){
    const def=FRAMES[frameId];
    const zones=(state.frameEdit&&state.frameEdit.id===frameId)?state.frameEdit.zones:def.zones;
    card.dataset.frame="custom"; inner=renderCustomFrame(def,zones);
    $("btnFlip").hidden=true;
  } else {
    card.dataset.frame="";
    inner=(RENDERERS[state.layout]||RENDERERS.normal)();
    $("btnFlip").hidden = state.layout!=="dfc";
  }
  card.innerHTML = inner;
  applyOverlays(card);
  fitCard();
  fitFullArt();
  fitCustomFrame();
  saveDraft();
}
/* auto-save do rascunho. So grava DEPOIS do boot (window.__autosaveReady);
   senao o render() inicial (carta padrao) sobrescreveria o rascunho da sessao
   anterior antes de o DOMContentLoaded restaura-lo. */
function saveDraft(){
  if(!window.__autosaveReady) return;
  let json;
  try { json = JSON.stringify(state); } catch(e){ return; }
  try { localStorage.setItem("forja_autosave", json); flashSaved(); }
  catch(e){
    try {
      const light = Object.assign({}, state, { art:null, backArt:null, overlays:[], setIcon:null, setIconTints:null });
      localStorage.setItem("forja_autosave", JSON.stringify(light)); flashSaved();
    } catch(_){ /* cota estourada: desiste em silencio */ }
  }
}
/* escala o card para caber na largura disponível (mobile) */
function fitCard(){
  const inner=document.querySelector(".stage-inner"); if(!inner||!card) return;
  // neutraliza o transform antes de medir, senão offsetWidth volta o valor já escalado
  // e o zoom do navegador acumula erro (layout "quebra")
  card.style.transform=""; card.style.transformOrigin="";
  const vw=document.documentElement.clientWidth||window.innerWidth||9999;
  const parentW=(inner.parentElement?inner.parentElement.clientWidth:inner.clientWidth)||vw;
  const stageW=Math.min(parentW, vw-16);
  const w0=card.offsetWidth||480, h0=card.offsetHeight||672;
  if(!stageW||!w0) return;
  const scale=Math.min(1, stageW/w0);
  if(scale<1){
    card.style.transformOrigin="top left";
    card.style.transform=`scale(${scale})`;
    inner.style.width=(w0*scale)+"px"; inner.style.height=(h0*scale)+"px";
  } else { inner.style.width=""; inner.style.height=""; }
}

/* BUG full-art: encolhe o texto até caber no painel inferior, sem cortar nada */
function fitFullArt(){
  if(state.style!=="fullart"||!card) return;
  const fa=card.querySelector(".card-frame.fa"); if(!fa) return;
  const bottom=fa.querySelector(".fa-bottom"), txt=fa.querySelector(".fa-text");
  if(!bottom||!txt) return;
  const maxH=(card.offsetHeight||672)*0.60;   /* painel inferior no máx. 60% da carta */
  let fs=15; txt.style.fontSize=fs+"px";
  let guard=0;
  while(bottom.offsetHeight>maxH && fs>8.5 && guard<60){ fs-=0.5; txt.style.fontSize=fs+"px"; guard++; }
}

/* refit ao redimensionar / dar zoom no navegador (zoom dispara resize) */
let __fitT=null;
function scheduleFit(){ clearTimeout(__fitT); __fitT=setTimeout(()=>{ fitCard(); fitFullArt(); fitCustomFrame(); },80); }
window.addEventListener("resize", scheduleFit, {passive:true});

/* ===== AUTO-AJUSTE DE FONTE (frames personalizados) =====
   Encolhe a fonte de cada zona até o conteúdo caber dentro dos limites
   da zona — nunca ultrapassa. Funciona em qualquer layout (criatura,
   encantamento, saga, batalha, classe, planeswalker, etc.) porque mede
   o overflow real da zona, seja qual for o conteúdo dentro dela. */
function fitZoneFont(el){
  const maxFs = parseFloat(el.dataset.maxsize) || parseFloat(getComputedStyle(el).fontSize) || 18;
  const minFs = parseFloat(el.dataset.minsize) || 8;
  let fs = maxFs;
  el.style.fontSize = fs + "px";          // sempre parte do tamanho máximo (sem efeito catraca entre renders)
  let guard = 0;
  // overflow de altura (texto multilinha) E de largura (linha única tipo nome/PT)
  while(guard < 160 && (el.scrollHeight > el.clientHeight + 0.5 || el.scrollWidth > el.clientWidth + 0.5)){
    fs -= 0.5;
    if(fs <= minFs){ el.style.fontSize = minFs + "px"; break; }
    el.style.fontSize = fs + "px";
    guard++;
  }
}
function fitCustomFrame(){
  if(!card) return;
  const root = card.querySelector(".cf-root");
  if(!root) return;
  root.querySelectorAll('.cf-zone[data-fit="1"]').forEach(fitZoneFont);
}
/* as fontes (Cinzel/Spectral/Bitter) carregam async; ao terminar, reajusta
   para a medição sair correta */
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(()=>{ fitFullArt(); fitCustomFrame(); });
}
if("ResizeObserver" in window){
  const si=document.querySelector(".stage-inner");
  if(si) new ResizeObserver(scheduleFit).observe(si.parentElement||si);
}

/* ============================================================
   LISTAS DINÂMICAS (pw / saga / class)
   ============================================================ */
function rowInput(val,ph,cls){return `<input type="text" class="${cls}" value="${escapeHTML(val)}" placeholder="${ph}">`;}
function renderRows(){
  // planeswalker
  $("pwRows").innerHTML=state.pw.map((a,i)=>`<div class="row" data-i="${i}">
    ${rowInput(a.cost,"+1","r-cost")}<textarea class="r-text" rows="2" placeholder="efeito da habilidade">${escapeHTML(a.text)}</textarea>
    <button type="button" class="r-del" data-del="pw" data-i="${i}">✕</button></div>`).join("");
  // saga
  $("sagaRows").innerHTML=state.saga.map((c,i)=>`<div class="row" data-i="${i}">
    ${rowInput(c.num,"I","r-cost")}<textarea class="r-text" rows="2" placeholder="efeito do capítulo">${escapeHTML(c.text)}</textarea>
    <button type="button" class="r-del" data-del="saga" data-i="${i}">✕</button></div>`).join("");
  // class
  $("classRows").innerHTML=state.cls.map((l,i)=>`<div class="row row-cls" data-i="${i}">
    ${rowInput(l.label,i===0?"Base":"Nível "+(i+1),"r-label")}${i===0?'<span class="r-spacer"></span>':rowInput(l.cost,"custo","r-costsm")}
    <textarea class="r-text" rows="2" placeholder="${i===0?'habilidade base':'habilidade do nível'}">${escapeHTML(l.text)}</textarea>
    <button type="button" class="r-del" data-del="class" data-i="${i}">✕</button></div>`).join("");
  bindRows();
}
function bindRows(){
  document.querySelectorAll("#pwRows .row").forEach(r=>{const i=+r.dataset.i;
    r.querySelector(".r-cost").oninput=e=>{state.pw[i].cost=e.target.value;render();};
    r.querySelector(".r-text").oninput=e=>{state.pw[i].text=e.target.value;render();};});
  document.querySelectorAll("#sagaRows .row").forEach(r=>{const i=+r.dataset.i;
    r.querySelector(".r-cost").oninput=e=>{state.saga[i].num=e.target.value;render();};
    r.querySelector(".r-text").oninput=e=>{state.saga[i].text=e.target.value;render();};});
  document.querySelectorAll("#classRows .row").forEach(r=>{const i=+r.dataset.i;
    r.querySelector(".r-label").oninput=e=>{state.cls[i].label=e.target.value;render();};
    const cs=r.querySelector(".r-costsm"); if(cs) cs.oninput=e=>{state.cls[i].cost=e.target.value;render();};
    r.querySelector(".r-text").oninput=e=>{state.cls[i].text=e.target.value;render();};});
  document.querySelectorAll(".r-del").forEach(b=>b.onclick=()=>{
    const k=b.dataset.del,i=+b.dataset.i; ({pw:state.pw,saga:state.saga,class:state.cls})[k].splice(i,1);
    renderRows();render();});
}
document.querySelectorAll(".mini-add").forEach(b=>b.onclick=()=>{
  const k=b.dataset.add;
  if(k==="pw") state.pw.push({cost:"+1",text:""});
  if(k==="saga") state.saga.push({num:"—",text:""});
  if(k==="class") state.cls.push({label:"Nível "+(state.cls.length+1),cost:"",text:""});
  renderRows();render();});

/* ============================================================
   COLETA / POPULAÇÃO DOS CAMPOS
   ============================================================ */
function collect(){
  state.layout=$("fLayout").value;
  state.color="auto";
  state.rarity=$("fRarity").value; if(state.setIcon) refreshSetIconUI();
  state.artist=$("fArtist").value;
  state.collector=$("fCollector").value;
  state.loyalty=$("fLoyalty").value;
  state.defense=$("fDefense").value;
  state.adv={name:$("fAdvName").value,mana:$("fAdvMana").value,type:$("fAdvType").value,rules:$("fAdvRules").value};
  state.split={name:$("fSplitName").value,mana:$("fSplitMana").value,type:$("fSplitType").value,rules:$("fSplitRules").value};
  state.back={name:$("fBackName").value,mana:$("fBackMana").value,type:$("fBackType").value,rules:$("fBackRules").value,flavor:$("fBackFlavor").value,pt:$("fBackPT").value};

  if(state.layout==="dfc" && state.showBack){
    // editando o verso pelos campos principais? Não — campos principais = frente.
  }
  state.name=$("fName").value; state.mana=$("fMana").value; state.type=$("fType").value;
  state.rules=$("fRules").value; state.flavor=$("fFlavor").value; state.pt=$("fPT").value;
}
function populate(){
  $("fLayout").value=state.layout; $("fRarity").value=state.rarity;
  $("fArtist").value=state.artist; $("fCollector").value=state.collector;
  $("fLoyalty").value=state.loyalty; $("fDefense").value=state.defense;
  $("fName").value=state.name; $("fMana").value=state.mana; $("fType").value=state.type;
  $("fRules").value=state.rules; $("fFlavor").value=state.flavor; $("fPT").value=state.pt;
  $("fAdvName").value=state.adv.name; $("fAdvMana").value=state.adv.mana; $("fAdvType").value=state.adv.type; $("fAdvRules").value=state.adv.rules;
  $("fSplitName").value=state.split.name; $("fSplitMana").value=state.split.mana; $("fSplitType").value=state.split.type; $("fSplitRules").value=state.split.rules;
  $("fBackName").value=state.back.name; $("fBackMana").value=state.back.mana; $("fBackType").value=state.back.type;
  $("fBackRules").value=state.back.rules; $("fBackFlavor").value=state.back.flavor; $("fBackPT").value=state.back.pt;
}

/* visibilidade conforme layout */
function applyLayoutVisibility(){
  const L=state.layout;
  document.querySelectorAll("[data-show]").forEach(el=>{
    const list=el.dataset.show;
    el.hidden = !(list==="all" || list.split(" ").includes(L));
  });
  // rótulos contextuais
  $("lblName").textContent = L==="emblem" ? "Origem (planeswalker)" : "Nome da carta";
  $("artFaceTag").hidden = L!=="dfc"; $("artFaceTag").textContent="(frente)";
}

/* sementes ao trocar de layout */
function seedLayout(L){
  if(L==="planeswalker" && state.pw.length===0)
    state.pw=[{cost:"+1",text:"Adicione um marcador de lealdade. Compre uma carta."},{cost:"−2",text:"Crie uma ficha de criatura 3/1 vermelha."},{cost:"−7",text:"Cause 7 pontos de dano dividido como quiser."}];
  if(L==="saga" && state.saga.length===0)
    state.saga=[{num:"I",text:"Crie uma ficha de tesouro."},{num:"II",text:"Compre uma carta."},{num:"III",text:"Procure por um terreno em seu grimório e o coloque em jogo."}];
  if(L==="class" && state.cls.length===0)
    state.cls=[{label:"Base",cost:"",text:"Quando esta Classe entrar em jogo, ganhe 3 pontos de vida."},{label:"Nível 2",cost:"1W",text:"Criaturas que você controla recebem +1/+1."},{label:"Nível 3",cost:"3W",text:"No início de seu combate, crie uma ficha de Soldado 1/1 branca."}];
}

/* ============================================================
   BINDINGS
   ============================================================ */
const mainInputs=["fName","fMana","fType","fRules","fFlavor","fPT","fRarity","fArtist","fCollector",
  "fLoyalty","fDefense","fAdvName","fAdvMana","fAdvType","fAdvRules","fSplitName","fSplitMana","fSplitType","fSplitRules",
  "fBackName","fBackMana","fBackType","fBackRules","fBackFlavor","fBackPT"];
mainInputs.forEach(id=>{const el=$(id); if(el){el.addEventListener("input",()=>{collect();render();});el.addEventListener("change",()=>{collect();render();});}});

/* tipo padrão por layout */
const DEFAULT_TYPE={normal:"Criatura — Humano Mago",land:"Terreno",planeswalker:"Lendário Planeswalker — Mago",
  saga:"Encantamento — Saga",class:"Encantamento — Classe",battle:"Batalha — Siege",
  adventure:"Criatura — Humano Ladino",token:"Ficha de Criatura — Espírito",emblem:"",dfc:"Criatura — Humano Mago",split:"Instantâneo"};
const DEFAULT_TYPES=new Set(Object.values(DEFAULT_TYPE));

$("fLayout").addEventListener("change",()=>{
  collect(); seedLayout(state.layout); state.showBack=false;
  // se o tipo ainda é um dos padrões, troca pelo padrão do novo layout
  if(state.type.trim()==="" || DEFAULT_TYPES.has(state.type.trim())){
    state.type=DEFAULT_TYPE[state.layout]||""; $("fType").value=state.type;
  }
  document.querySelectorAll(".face-btn").forEach(b=>b.classList.toggle("active",b.dataset.face==="front"));
  applyLayoutVisibility(); renderRows(); render();
});

/* DFC: alternar prévia */
document.querySelectorAll(".face-btn").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".face-btn").forEach(x=>x.classList.remove("active"));
  b.classList.add("active"); state.showBack=b.dataset.face==="back"; render();});
$("btnFlip").addEventListener("click",()=>{ state.showBack=!state.showBack;
  document.querySelectorAll(".face-btn").forEach(x=>x.classList.toggle("active",(x.dataset.face==="back")===state.showBack));
  render();});

/* modos manual/IA */
document.querySelectorAll(".mode-btn").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".mode-btn").forEach(b=>b.classList.remove("active"));
  btn.classList.add("active"); $("pane-ai").hidden=btn.dataset.mode!=="ai";}));

/* abas de arte */
document.querySelectorAll(".art-tab").forEach(tab=>tab.addEventListener("click",()=>{
  document.querySelectorAll(".art-tab").forEach(t=>t.classList.remove("active"));
  tab.classList.add("active"); $("art-upload").hidden=tab.dataset.art!=="upload"; $("art-ai").hidden=tab.dataset.art!=="ai";}));

/* upload frente */
function setArt(url,back){ if(back) state.backArt=url; else state.art=url; render(); }
function readFile(file,back){ if(!file||!file.type.startsWith("image/")) return toast("Selecione uma imagem.",true);
  const r=new FileReader(); r.onload=e=>setArt(e.target.result,back); r.readAsDataURL(file); }
$("fileInput").addEventListener("change",e=>readFile(e.target.files[0],false));
/* ---- upload do ícone de raridade ---- */
$("btnSetIcon").addEventListener("click",()=>$("fSetIcon").click());
$("fSetIcon").addEventListener("change",e=>{
  const f=e.target.files[0];
  if(!f||!f.type.startsWith("image/")) return toast("Selecione uma imagem PNG.",true);
  const r=new FileReader();
  r.onload=async ev=>{
    try{
      state.setIcon=ev.target.result;
      state.setIconTints=await buildSetIconTints(state.setIcon);
      refreshSetIconUI(); render(); toast("Ícone de raridade aplicado.");
    }catch(_){ toast("Não consegui ler esse ícone.",true); }
  };
  r.readAsDataURL(f); e.target.value="";
});
$("btnSetIconClear").addEventListener("click",()=>{
  state.setIcon=""; state.setIconTints=null; refreshSetIconUI(); render(); toast("Ícone removido — voltei ao símbolo padrão.");
});
function refreshSetIconUI(){
  const has=!!state.setIcon;
  const prev=$("setIconPrev");
  prev.hidden=!has; if(has) prev.src=(state.setIconTints&&state.setIconTints[state.rarity])||state.setIcon;
  $("btnSetIconClear").hidden=!has;
  $("btnSetIcon").textContent=has?"↥ Trocar ícone":"↥ Enviar ícone";
}

/* ===== SÍMBOLOS DE COLEÇÃO DO MTG (fonte Keyrune, via jsDelivr) =====
   1) baixa o keyrune.css e extrai o mapa código-da-coleção -> glifo unicode;
   2) carrega a fonte woff2 via FontFace;
   3) cruza com /sets do Scryfall para mostrar o nome bonito de cada coleção;
   4) ao escolher, desenha o glifo num canvas -> PNG com alpha -> entra no
      pipeline de recolorização por raridade já existente (buildSetIconTints).
   O PNG fica salvo na carta, então nada depende do CDN depois da escolha.  */
const KEYRUNE={ css:"https://cdn.jsdelivr.net/npm/keyrune@latest/css/keyrune.css",
                woff2:"https://cdn.jsdelivr.net/npm/keyrune@latest/fonts/keyrune.woff2",
                map:null, names:null, fontReady:false, loading:null };
async function loadKeyrune(){
  if(KEYRUNE.map && KEYRUNE.fontReady) return;
  if(KEYRUNE.loading) return KEYRUNE.loading;
  KEYRUNE.loading=(async()=>{
    /* mapa código -> unicode, com cache de 7 dias */
    const KEY="forja_keyrune_v1", TTL=7*24*60*60*1000;
    try{
      const c=JSON.parse(localStorage.getItem(KEY)||"null");
      if(c && (Date.now()-c.at)<TTL && c.map){ KEYRUNE.map=c.map; KEYRUNE.names=c.names||null; }
    }catch(_){}
    if(!KEYRUNE.map){
      const css=await (await fetch(KEYRUNE.css)).text();
      const map={}; const re=/\.ss-([a-z0-9][a-z0-9_-]*)(?::{1,2}before)\s*\{\s*content:\s*"\\([0-9a-f]+)"/gi;
      let m; while((m=re.exec(css))) map[m[1].toLowerCase()]=parseInt(m[2],16);
      KEYRUNE.map=map;
      /* nomes das coleções via Scryfall (opcional — se falhar, mostra só o código) */
      try{
        const sets=await (await fetch("https://api.scryfall.com/sets")).json();
        const names={};
        (sets.data||[]).forEach(s=>{ names[s.code.toLowerCase()]={n:s.name,y:(s.released_at||"").slice(0,4)}; });
        KEYRUNE.names=names;
      }catch(_){ KEYRUNE.names=null; }
      try{ localStorage.setItem(KEY,JSON.stringify({at:Date.now(),map:KEYRUNE.map,names:KEYRUNE.names})); }catch(_){}
    }
    if(!KEYRUNE.fontReady){
      const face=new FontFace("Keyrune",`url(${KEYRUNE.woff2}) format("woff2")`);
      await face.load(); document.fonts.add(face); KEYRUNE.fontReady=true;
    }
  })();
  try{ await KEYRUNE.loading; } finally { KEYRUNE.loading=null; }
}
/* desenha um glifo Keyrune num canvas e devolve PNG (máscara alpha, recortada) */
function keyruneGlyphToPng(codePoint){
  const S=256, c=document.createElement("canvas"); c.width=S; c.height=S;
  const x=c.getContext("2d");
  x.font=`${Math.round(S*0.78)}px Keyrune`; x.textAlign="center"; x.textBaseline="middle";
  x.fillStyle="#000"; x.fillText(String.fromCodePoint(codePoint), S/2, S/2);
  /* recorta as bordas transparentes para o ícone encaixar certinho na zona */
  const d=x.getImageData(0,0,S,S).data;
  let minX=S,minY=S,maxX=0,maxY=0;
  for(let py=0;py<S;py++) for(let px=0;px<S;px++){
    if(d[(py*S+px)*4+3]>8){ if(px<minX)minX=px; if(px>maxX)maxX=px; if(py<minY)minY=py; if(py>maxY)maxY=py; }
  }
  if(maxX<=minX||maxY<=minY) return c.toDataURL("image/png");
  const w=maxX-minX+1,h=maxY-minY+1,pad=Math.round(Math.max(w,h)*0.04);
  const o=document.createElement("canvas"); o.width=w+pad*2; o.height=h+pad*2;
  o.getContext("2d").drawImage(c,minX,minY,w,h,pad,pad,w,h);
  return o.toDataURL("image/png");
}
function keyruneRenderGrid(filter){
  const grid=$("keyruneGrid"); if(!grid||!KEYRUNE.map) return;
  const q=(filter||"").trim().toLowerCase();
  const items=[];
  for(const code of Object.keys(KEYRUNE.map)){
    const meta=(KEYRUNE.names&&KEYRUNE.names[code])||null;
    const label=meta?meta.n:code.toUpperCase();
    if(q && !code.includes(q) && !(label.toLowerCase().includes(q))) continue;
    items.push({code,cp:KEYRUNE.map[code],label,year:meta?meta.y:""});
  }
  items.sort((a,b)=>(b.year||"0").localeCompare(a.year||"0")||a.label.localeCompare(b.label));
  const shown=items.slice(0,90);
  grid.innerHTML = shown.length
    ? shown.map(it=>`<button type="button" class="ks-item" data-code="${it.code}" data-cp="${it.cp}">
        <span class="ks-glyph">${String.fromCodePoint(it.cp)}</span>
        <span class="ks-name">${escapeHTML(it.label)}<small>${it.code.toUpperCase()}${it.year?" · "+it.year:""}</small></span>
      </button>`).join("") + (items.length>90?`<p class="hint" style="grid-column:1/-1;margin:4px 0 0">mostrando 90 de ${items.length} — refine a busca</p>`:"")
    : `<p class="hint" style="margin:0">nenhuma coleção encontrada.</p>`;
}
$("btnSetIconLib").addEventListener("click",async()=>{
  $("keyruneModal").hidden=false;
  try{
    await loadKeyrune();
    keyruneRenderGrid($("keyruneSearch").value);
  }catch(e){
    $("keyruneGrid").innerHTML=`<p class="hint" style="margin:0">Não consegui carregar os símbolos agora (verifique a conexão). Você ainda pode enviar um PNG próprio.</p>`;
  }
});
$("keyruneClose").addEventListener("click",()=>{ $("keyruneModal").hidden=true; });
$("keyruneModal").addEventListener("click",e=>{ if(e.target===$("keyruneModal")) $("keyruneModal").hidden=true; });
$("keyruneSearch").addEventListener("input",()=>keyruneRenderGrid($("keyruneSearch").value));
$("keyruneGrid").addEventListener("click",async e=>{
  const btn=e.target.closest(".ks-item"); if(!btn) return;
  const cp=parseInt(btn.dataset.cp,10); if(!cp) return;
  try{
    const png=keyruneGlyphToPng(cp);
    state.setIcon=png;
    state.setIconTints=await buildSetIconTints(png);
    refreshSetIconUI(); render();
    $("keyruneModal").hidden=true;
    toast(`Símbolo de ${btn.dataset.code.toUpperCase()} aplicado.`);
  }catch(_){ toast("Não consegui aplicar esse símbolo.",true); }
});
$("fileInputBack").addEventListener("change",e=>readFile(e.target.files[0],true));
const dz=$("dropzone");
["dragenter","dragover"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add("drag");}));
["dragleave","drop"].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove("drag");}));
dz.addEventListener("drop",e=>readFile(e.dataTransfer.files[0],false));

/* ============================================================
   IA
   ============================================================ */
function spin(btn,on){btn.disabled=on;btn.querySelector(".btn-txt").hidden=on;btn.querySelector(".btn-spin").hidden=!on;}

$("btnAiCard").addEventListener("click",async()=>{
  const prompt=$("aiPrompt").value.trim(); if(!prompt) return toast("Descreva a ideia primeiro.",true);
  if(!aiAllowed()) return;
  const btn=$("btnAiCard"); spin(btn,true);
  try{
    const res=await fetch("/api/generate-card",{method:"POST",headers:aiHeaders(),
      body:JSON.stringify({prompt,layout:$("aiLayout").value,color:$("aiColor").value})});
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`Erro ${res.status}`);
    const c=await res.json(); applyAICard(c); toast("Carta gerada! Edite o que quiser.");
    if(c.artPrompt) $("artPrompt").value=c.artPrompt;
  }catch(err){toast(err.message,true);} finally{spin(btn,false);}
});

function applyAICard(c){
  const L=["normal","land","planeswalker","saga","class","battle","adventure","token","emblem","dfc","split"].includes(c.layout)?c.layout:"normal";
  state.layout=L;
  state.name=c.name||""; state.mana=c.mana||""; state.type=c.type||"";
  state.rules=c.rules||""; state.flavor=c.flavor||""; state.pt=c.pt||"";
  if(["comum","incomum","rara","mítica"].includes(c.rarity)) state.rarity=c.rarity;
  state.color="auto"; state.loyalty=c.loyalty||"4"; state.defense=c.defense||"5";
  state.pw = Array.isArray(c.pwAbilities)? c.pwAbilities.map(a=>({cost:a.cost||"",text:a.text||""})):[];
  state.saga = Array.isArray(c.sagaChapters)? c.sagaChapters.map(a=>({num:a.num||a.numeral||"",text:a.text||""})):[];
  state.cls = Array.isArray(c.classLevels)? c.classLevels.map(a=>({label:a.label||"",cost:a.cost||"",text:a.text||""})):[];
  if(c.adventure) state.adv={name:c.adventure.name||"",mana:c.adventure.mana||"",type:c.adventure.type||"Instantâneo — Aventura",rules:c.adventure.rules||""};
  if(c.split) state.split={name:c.split.name||"",mana:c.split.mana||"",type:c.split.type||"",rules:c.split.rules||""};
  if(c.back) state.back={name:c.back.name||"",mana:c.back.mana||"",type:c.back.type||"",rules:c.back.rules||"",flavor:c.back.flavor||"",pt:c.back.pt||""};
  seedLayout(L);
  $("fLayout").value=L; state.showBack=false;
  populate(); applyLayoutVisibility(); renderRows(); render();
}

$("btnAiArt").addEventListener("click",async()=>{
  const prompt=$("artPrompt").value.trim(); if(!prompt) return toast("Descreva a arte primeiro.",true);
  if(!aiAllowed()) return;
  const btn=$("btnAiArt"); spin(btn,true);
  // proporção da arte conforme o layout/estilo (parametrizada no código)
  const aspect = state.style==="fullart" ? "3:4"
    : ({ saga:"3:4", planeswalker:"4:3", battle:"16:9", emblem:"16:9", class:"16:9", token:"4:3", land:"3:2" })[state.layout] || "3:2";
  try{
    const res=await fetch("/api/generate-art",{method:"POST",headers:aiHeaders(),body:JSON.stringify({prompt, aspect})});
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`Erro ${res.status}`);
    const d=await res.json(); if(d.image) setArt(d.image, state.layout==="dfc"&&state.showBack); else throw new Error("Resposta sem imagem.");
    toast("Arte gerada!");
  }catch(err){toast(err.message,true);} finally{spin(btn,false);}
});

/* ============================================================
   IMPORTAR CARTA REAL — Scryfall (somente dados; sem a arte)
   ============================================================ */
const RAR={common:"comum",uncommon:"incomum",rare:"rara",mythic:"mítica"};
function normMinus(s){return (s||"").replace(/\u2212/g,"−");}

function parsePWAbilities(text){
  const out=[];
  (text||"").split("\n").forEach(line=>{
    const m=line.match(/^\s*([+\u2212\-]?\d+|0)\s*:\s*(.+)$/);
    if(m) out.push({cost:normMinus(m[1].replace(/^-/,"−")),text:m[2].trim()});
  });
  return out;
}
function parseSagaChapters(text){
  const out=[];
  (text||"").split("\n").forEach(line=>{
    const m=line.match(/^\s*([IVXLCDM]+(?:\s*,\s*[IVXLCDM]+)*)\s*[—\-–]\s*(.+)$/i);
    if(m) out.push({num:m[1].replace(/\s+/g,"").replace(/,/g,", "),text:m[2].trim()});
  });
  return out;
}
function parseClassLevels(text){
  const lines=(text||"").split("\n").filter(l=>l.trim() && !/^\(/.test(l.trim()));
  const out=[]; let base=[];
  lines.forEach(line=>{
    const m=line.match(/^Level\s+(\d+)\s*(\{[^:]*\})?\s*:?\s*(.*)$/i);
    if(m){ out.push({label:"Nível "+m[1],cost:(m[2]||"").replace(/[{}]/g,""),text:m[3].trim()}); }
    else if(out.length===0){ base.push(line.trim()); }
    else { out[out.length-1].text+="\n"+line.trim(); }
  });
  out.unshift({label:"Base",cost:"",text:base.join("\n")});
  return out;
}

function mapScryfall(c){
  // reset de listas
  Object.assign(state,{pw:[],saga:[],cls:[],adv:{name:"",mana:"",type:"",rules:""},
    split:{name:"",mana:"",type:"",rules:""},back:{name:"",mana:"",type:"",rules:"",flavor:"",pt:""},showBack:false});
  state.rarity=RAR[c.rarity]||"incomum"; state.color="auto"; state.artist=c.artist||"—";
  state.collector=(c.collector_number?c.collector_number:"")+(c.set?(" · "+c.set.toUpperCase()):"");

  const faces=c.card_faces;
  const sl=(c.layout||"").toLowerCase();
  const typeLine=c.type_line||"";

  const fill=(src)=>{ state.name=src.name||""; state.mana=src.mana_cost||""; state.type=src.type_line||"";
    state.rules=src.oracle_text||""; state.flavor=src.flavor_text||"";
    state.pt=(src.power!=null&&src.toughness!=null)?`${src.power}/${src.toughness}`:""; };

  if(sl==="saga"){ state.layout="saga"; fill(c); state.saga=parseSagaChapters(c.oracle_text); state.rules=""; }
  else if(sl==="class"){ state.layout="class"; fill(c); state.cls=parseClassLevels(c.oracle_text); state.rules=""; }
  else if(sl==="planeswalker" || /Planeswalker/i.test(typeLine)){ state.layout="planeswalker"; fill(c);
    state.loyalty=(c.loyalty!=null?String(c.loyalty):"4"); state.pw=parsePWAbilities(c.oracle_text); state.rules=""; }
  else if(sl==="battle"){ state.layout="battle"; fill(c); state.defense=(c.defense!=null?String(c.defense):"5"); }
  else if(sl==="adventure" && faces){ state.layout="adventure"; fill(faces[0]);
    state.adv={name:faces[1].name||"",mana:faces[1].mana_cost||"",type:faces[1].type_line||"Instantâneo — Aventura",rules:faces[1].oracle_text||""}; }
  else if(sl==="split" && faces){ state.layout="split"; fill(faces[0]);
    state.split={name:faces[1].name||"",mana:faces[1].mana_cost||"",type:faces[1].type_line||"",rules:faces[1].oracle_text||""}; }
  else if((sl==="transform"||sl==="modal_dfc"||sl==="double_faced_token") && faces){ state.layout="dfc"; fill(faces[0]);
    const b=faces[1]; state.back={name:b.name||"",mana:b.mana_cost||"",type:b.type_line||"",rules:b.oracle_text||"",
      flavor:b.flavor_text||"",pt:(b.power!=null&&b.toughness!=null)?`${b.power}/${b.toughness}`:""}; }
  else if(sl==="token" || /\bToken\b/.test(typeLine)){ state.layout="token"; fill(c); }
  else { state.layout="normal"; fill(c); }

  $("fLayout").value=state.layout;
  populate(); applyLayoutVisibility(); renderRows(); render();
  applyScrySetIcon(c.set);   // ícone da coleção (Keyrune) — assíncrono, silencioso se falhar
}
/* aplica automaticamente o símbolo da coleção importada do Scryfall,
   usando o mesmo pipeline do seletor Keyrune (glifo -> PNG -> tints) */
async function applyScrySetIcon(setCode){
  if(!setCode) return;
  try{
    await loadKeyrune();
    const cp=KEYRUNE.map && KEYRUNE.map[String(setCode).toLowerCase()];
    if(!cp) return;
    try{ await document.fonts.load("20px Keyrune"); }catch(_){}
    const png=keyruneGlyphToPng(cp);
    state.setIcon=png;
    state.setIconTints=await buildSetIconTints(png);
    refreshSetIconUI(); render();
  }catch(_){ /* sem conexão ou coleção sem glifo: segue sem ícone */ }
}

async function importScryfall(name){
  const r=await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`,{headers:{Accept:"application/json"}});
  if(r.status===404){ const j=await r.json().catch(()=>({})); throw new Error(j.details||"Carta não encontrada."); }
  if(!r.ok) throw new Error("Scryfall retornou "+r.status);
  return r.json();
}
$("btnScry").addEventListener("click",async()=>{
  const name=$("scryName").value.trim(); if(!name) return toast("Digite o nome de uma carta.",true);
  const btn=$("btnScry"); spin(btn,true);
  try{ const c=await importScryfall(name); mapScryfall(c);
    toast("Importado: "+(c.name||name)+" — dados em inglês, edite à vontade.");
  }catch(err){ toast(err.message,true); } finally{ spin(btn,false); }
});
$("scryName").addEventListener("keydown",e=>{ if(e.key==="Enter"){e.preventDefault();$("btnScry").click();} });

/* ============================================================
   EXPORTAR PNG
   ============================================================ */
$("btnExport").addEventListener("click",async()=>{
  const pT=card.style.transform, pO=card.style.transformOrigin, pIW=document.querySelector(".stage-inner")?.style.width, pIH=document.querySelector(".stage-inner")?.style.height;
  try{ toast("Renderizando…");
    card.style.transform=""; card.style.transformOrigin="";   // captura em tamanho cheio
    const url=await htmlToImage.toPng(card,{pixelRatio:2,cacheBust:true,backgroundColor:null});
    const a=document.createElement("a");
    const safe=(state.name||"carta").replace(/[^\w\-]+/g,"_").toLowerCase();
    a.download=`${safe}${state.layout==="dfc"?(state.showBack?"_verso":"_frente"):""}.png`; a.href=url; a.click();
    toast("PNG exportado!");
  }catch(err){toast("Falha ao exportar: "+err.message,true);}
  finally{ card.style.transform=pT; card.style.transformOrigin=pO; fitCard(); }
});

/* ============================================================
   EXEMPLO
   ============================================================ */
const SAMPLES=[
  {layout:"planeswalker",name:"Vael, Chama Errante",mana:"3RR",type:"Lendário Planeswalker — Vael",loyalty:"4",
   pw:[{cost:"+1",text:"Cause 2 pontos de dano a qualquer alvo."},{cost:"−3",text:"Crie duas fichas de Elemental 1/1 vermelhas com ímpeto."},{cost:"−8",text:"Você consegue um emblema com \"Suas mágicas instantâneas e de feitiço custam {2} a menos.\""}],
   rarity:"mítica",artist:"você",collector:"112/281"},
  {layout:"saga",name:"A Queda de Eldros",mana:"1B",type:"Encantamento — Saga",
   saga:[{num:"I",text:"Cada oponente sacrifica uma criatura."},{num:"II",text:"Retorne uma criatura alvo de seu cemitério para sua mão."},{num:"III",text:"Crie um Demônio 5/5 preto com voar."}],rarity:"rara"},
  {layout:"battle",name:"Cerco a Pedralbor",mana:"4",type:"Batalha — Siege",defense:"6",
   rules:"Quando Cerco a Pedrablor entrar em jogo, ele ataca um jogador.\nQuando a última defesa for removida, exile-a e depois conjure-a transformada.",flavor:"",rarity:"rara"},
  {layout:"adventure",name:"Andarilha das Sombras",mana:"2B",type:"Criatura — Humano Ladino",pt:"2/3",
   rules:"Ameaçar\nQuando a Andarilha das Sombras atacar, cada oponente descarta uma carta.",flavor:"",
   adv:{name:"Sumiço",mana:"B",type:"Instantâneo — Aventura",rules:"A criatura alvo recebe −3/−0 até o fim do turno."},rarity:"incomum"},
  {layout:"token",name:"Dragão",mana:"",type:"Ficha de Criatura — Dragão",pt:"5/5",rules:"Voar",rarity:"comum",artist:"você",collector:"—"},
];
/* sorteia uma carta REAL do Scryfall (mesmo mapeamento do "Buscar").
   restringe a cartas de papel comuns para mapear bem e dar "ar de realidade". */
async function randomScryfall(){
  const q="-is:funny -is:digital -t:token -t:emblem -t:plane -t:phenomenon -t:scheme -t:vanguard -t:conspiracy";
  const r=await fetch(`https://api.scryfall.com/cards/random?q=${encodeURIComponent(q)}`,{headers:{Accept:"application/json"}});
  if(!r.ok) throw new Error("Scryfall retornou "+r.status);
  return r.json();
}
/* fallback local (usado offline ou se o Scryfall falhar) */
function loadLocalSample(){
  const s=SAMPLES[Math.floor(Math.random()*SAMPLES.length)];
  Object.assign(state,{name:"",mana:"",type:"",rules:"",flavor:"",pt:"",loyalty:"4",defense:"5",pw:[],saga:[],cls:[],
    adv:{name:"",mana:"",type:"",rules:""},color:"auto",rarity:"incomum",artist:"você",collector:"001/250"});
  Object.assign(state,s); state.showBack=false; $("fLayout").value=state.layout;
  populate(); applyLayoutVisibility(); renderRows(); render();
}
$("btnRandom").addEventListener("click",async()=>{
  if(!confirm("Carregar um exemplo aleatório? Isto substitui a carta atual — o que não estiver salvo será perdido.")) return;
  const btn=$("btnRandom"), label=btn.textContent;
  btn.disabled=true; btn.textContent="⟳ Sorteando…";
  try{
    const c=await randomScryfall(); mapScryfall(c);
    toast("Exemplo: "+(c.name||"carta")+" — dados reais em inglês, edite à vontade.");
  }catch(err){
    loadLocalSample();
    toast("Sem conexão com o Scryfall — carreguei um exemplo local.");
  }finally{ btn.disabled=false; btn.textContent=label; }
});

/* ============================================================
   TOAST + INIT
   ============================================================ */
let tt; function toast(msg,err=false){const t=$("toast");t.textContent=msg;t.classList.toggle("err",err);t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2600);}

/* foil */
$("fFoil").addEventListener("click",()=>{ state.foil=!state.foil;
  $("fFoil").setAttribute("aria-pressed",state.foil?"true":"false");
  $("fFoil").classList.toggle("on",state.foil); render(); });

/* seletor de frame personalizado */
$("fFrame").addEventListener("change",()=>{
  state.frame=$("fFrame").value||"auto";
  const specific=!!(state.frame && state.frame!=="auto" && FRAMES[state.frame]);
  state.frameEdit = specific ? {id:state.frame,zones:clone(FRAMES[state.frame].zones||{})} : null;
  $("zoneEditor").hidden = !specific;   // editor de zonas só no modo de frame fixo
  if(specific) buildZoneEditor();
  render();
});

/* ---- editor de zonas (sliders) ---- */
const ZONE_LABELS={art:"Arte",name:"Nome",mana:"Custo",type:"Tipo",text:"Texto",pt:"P/R",loyalty:"Lealdade",defense:"Defesa",credit:"Crédito",rarity:"Ícone de coleção"};
function buildZoneEditor(){
  const z=state.frameEdit.zones; const box=$("zoneControls"); box.innerHTML="";
  Object.keys(z).forEach(key=>{
    const Z=z[key]; const wrap=document.createElement("div"); wrap.className="zrow";
    let html=`<div class="zhead">${ZONE_LABELS[key]||key}</div>`+
      ["x","y","w","h"].map(dim=>`<label class="zsl"><span>${dim.toUpperCase()}</span>
        <input type="range" min="0" max="100" step="0.5" value="${Z[dim]!=null?Z[dim]:0}" data-k="${key}" data-d="${dim}">
        <output>${Z[dim]!=null?Z[dim]:0}</output></label>`).join("");
    // controle de tamanho de fonte (só zonas com texto; a mana são pips)
    if(Z.size!=null){
      html+=`<label class="zsl zsl-font"><span>Aa</span>
        <input type="range" min="6" max="64" step="0.5" value="${Z.size}" data-k="${key}" data-d="size">
        <output>${Z.size}px</output></label>`;
    }
    wrap.innerHTML=html; box.appendChild(wrap);
  });
  box.querySelectorAll('input[type="range"]').forEach(inp=>{
    inp.addEventListener("input",e=>{
      const k=e.target.dataset.k,d=e.target.dataset.d,v=parseFloat(e.target.value);
      state.frameEdit.zones[k][d]=v;
      e.target.nextElementSibling.textContent = d==="size" ? v+"px" : v;
      render();
    });
  });
}
$("btnZoneReset").addEventListener("click",()=>{
  if(!state.frameEdit) return;
  state.frameEdit.zones=clone(FRAMES[state.frame].zones||{}); buildZoneEditor(); render(); toast("Zonas restauradas.");
});
$("btnZoneCopy").addEventListener("click",async()=>{
  if(!state.frameEdit) return;
  const def=FRAMES[state.frame];
  const out=JSON.stringify({id:def.id,name:def.name,src:def.src,zones:state.frameEdit.zones},null,2);
  try{ await navigator.clipboard.writeText(out); toast("JSON copiado — cole no frames.json."); }
  catch{ toast("Copie manualmente:\n"+out.slice(0,60)+"…",false); console.log(out); }
});

async function loadManaSymbols(){
  try{
    const r=await fetch("assets/mana/mana.json",{cache:"no-store"});
    if(!r.ok) throw new Error("manifest "+r.status);
    const list=await r.json();
    (list||[]).forEach(m=>{ if(m && m.code) MANA[String(m.code).toUpperCase()]=m; });
    if(typeof buildManaPalette==="function") buildManaPalette();  // agora os botões mostram os SVGs reais
    render();
    buildManaShadows().then(()=>render());   // sombra pré-composta nos símbolos do custo
  }catch(e){ /* pasta ausente ou file:// : usa só os símbolos embutidos */ }
}
async function loadFrames(){
  try{
    const r=await fetch("assets/frames/frames.json",{cache:"no-store"});
    if(!r.ok) throw new Error("manifest "+r.status);
    const list=await r.json(); const sel=$("fFrame");
    list.forEach(def=>{ if(!def.id||!def.src) return; FRAMES[def.id]=def;
      const o=document.createElement("option"); o.value=def.id; o.textContent=def.name||def.id; sel.appendChild(o); });
    sel.value=state.frame||"auto";   // reflete a seleção atual agora que as opções existem
    render();                         // re-renderiza com o frame automático já resolvido
  }catch(e){
    // file:// ou pasta ausente: mantém só "Padrão" e mostra a dica
    $("frameHint").style.display="block";
  }
}

/* estado inicial = o que está nos campos */
/* ---------- SOBREPOSIÇÕES (PNG por cima) ---------- */
function renderOvList(){
  const box=$("ovList"); if(!box) return;
  if(!state.overlays.length){ box.innerHTML=`<p class="hint" style="margin:0">Nenhuma sobreposição. Adicione um PNG (de preferência com fundo transparente).</p>`; return; }
  box.innerHTML=state.overlays.map((o,i)=>`<div class="ov-row">
    <div class="ov-rowhead">
      <img class="ov-thumb" src="${o.src}" alt="">
      <span>PNG ${i+1}</span>
      <select class="ov-layer-sel" data-i="${i}" title="camada">
        <option value="front"${(o.layer||"front")==="front"?" selected":""}>Frente</option>
        <option value="back"${o.layer==="back"?" selected":""}>Atrás do texto</option>
      </select>
      <button type="button" class="ov-mv" data-i="${i}" data-mv="-1" title="subir"${i===0?" disabled":""}>↑</button>
      <button type="button" class="ov-mv" data-i="${i}" data-mv="1" title="descer"${i===state.overlays.length-1?" disabled":""}>↓</button>
      <button type="button" class="ov-del" data-i="${i}" title="remover">✕</button>
    </div>
    ${[["x","X"],["y","Y"],["w","L"],["h","A"],["opacity","α"]].map(([d,lab])=>`<label class="zsl"><span>${lab}</span><input type="range" min="0" max="100" step="0.5" value="${o[d]}" data-i="${i}" data-d="${d}"><output>${o[d]}</output></label>`).join("")}
  </div>`).join("");
  box.querySelectorAll('input[type="range"]').forEach(inp=>inp.addEventListener("input",e=>{
    const i=+e.target.dataset.i, d=e.target.dataset.d;
    state.overlays[i][d]=parseFloat(e.target.value); e.target.nextElementSibling.textContent=e.target.value; render();
  }));
  box.querySelectorAll(".ov-layer-sel").forEach(sel=>sel.addEventListener("change",e=>{
    state.overlays[+e.target.dataset.i].layer=e.target.value; render();
  }));
  box.querySelectorAll(".ov-mv").forEach(b=>b.onclick=()=>{
    const i=+b.dataset.i, j=i+(+b.dataset.mv);
    if(j<0||j>=state.overlays.length) return;
    const a=state.overlays; [a[i],a[j]]=[a[j],a[i]]; renderOvList(); render();
  });
  box.querySelectorAll(".ov-del").forEach(b=>b.onclick=()=>{ state.overlays.splice(+b.dataset.i,1); renderOvList(); render(); });
}
$("ovInput").addEventListener("change",e=>{
  const f=e.target.files[0]; if(!f||!f.type.startsWith("image/")) return;
  const r=new FileReader();
  r.onload=ev=>{ state.overlays.push({src:ev.target.result,x:8,y:8,w:84,h:84,opacity:100,layer:"front"}); renderOvList(); render(); };
  r.readAsDataURL(f); e.target.value="";
});

collect(); applyLayoutVisibility(); renderRows(); renderOvList(); render(); loadFrames(); loadManaSymbols();
loadScryTypes().then(()=>render());   // catálogos de tipos do Scryfall p/ detecção de frame
window.addEventListener("resize", fitCard);
window.addEventListener("orientationchange", ()=>setTimeout(fitCard, 250));
window.addEventListener("load", fitCard);

/* ============================================================
   INTEGRAÇÃO COM CONTA (account.js) + BLOQUEIO VIP DA IA
   ============================================================ */
function aiHeaders(){
  const h={"Content-Type":"application/json"};
  const t=window.ForgeAuth&&window.ForgeAuth.token; if(t) h["Authorization"]="Bearer "+t;
  return h;
}
function aiAllowed(){
  // se o login não estiver configurado, a IA fica aberta (comportamento atual)
  if(!(window.FORGE_CONFIG&&window.FORGE_CONFIG.SUPABASE_URL&&!window.FORGE_CONFIG.SUPABASE_URL.includes("SEU-PROJETO"))) return true;
  if(!window.ForgeAuth||!window.ForgeAuth.user){ toast("Entre na sua conta para usar a IA.",true); return false; }
  if(!window.ForgeAuth.isVip){ toast("A geração por IA é um recurso VIP.",true); return false; }
  return true;
}

/* expõe toast e (de)serialização da carta para o account.js */
window.toastForge = (m,e)=>toast(m,e);
window.Forge = {
  serialize(){
    return {layout:state.layout,color:state.color,style:state.style,foil:state.foil,frame:state.frame,
      name:state.name,mana:state.mana,type:state.type,rules:state.rules,flavor:state.flavor,pt:state.pt,
      rarity:state.rarity,artist:state.artist,collector:state.collector,art:state.art,backArt:state.backArt,
      setIcon:state.setIcon,setIconTints:state.setIconTints,
      loyalty:state.loyalty,defense:state.defense,pw:state.pw,saga:state.saga,cls:state.cls,
      adv:state.adv,split:state.split,back:state.back,overlays:state.overlays};
  },
  load(o){
    if(!o) return;
    Object.assign(state,{pw:[],saga:[],cls:[],overlays:[],setIcon:"",setIconTints:null});
    ["layout","color","style","foil","frame","name","mana","type","rules","flavor","pt","rarity",
     "artist","collector","art","backArt","setIcon","setIconTints","loyalty","defense","pw","saga","cls","adv","split","back","overlays"]
      .forEach(k=>{ if(o[k]!==undefined) state[k]=o[k]; });
    state.showBack=false; state.frameEdit=null;
    if(!state.frame || (state.frame!=="auto" && !FRAMES[state.frame])) state.frame="auto";  // cartas antigas com frame embutido -> automático
    $("fLayout").value=state.layout; $("fFrame").value=state.frame||"auto";
    $("fFoil").setAttribute("aria-pressed",state.foil?"true":"false"); $("fFoil").classList.toggle("on",!!state.foil);
    const custom=!!(state.frame&&state.frame!=="auto"&&FRAMES[state.frame]); $("zoneEditor").hidden=!custom;
    populate(); applyLayoutVisibility(); renderRows(); renderOvList(); refreshSetIconUI(); render();
  }
};
/* renderiza a prévia de uma carta (objeto data) dentro de um elemento, sem afetar o editor */
window.Forge.previewInto = function(el, data){
  if(!el || !data) return;
  const snap = JSON.parse(JSON.stringify(state));
  try{
    Object.assign(state,{pw:[],saga:[],cls:[],overlays:[],setIcon:"",setIconTints:null});
    ["layout","color","style","foil","frame","name","mana","type","rules","flavor","pt","rarity",
     "artist","collector","art","backArt","setIcon","setIconTints","loyalty","defense","pw","saga","cls","adv","split","back","overlays"]
      .forEach(k=>{ if(data[k]!==undefined) state[k]=data[k]; });
    state.showBack=false;
    let col=state.color; if(col==="auto") col=autoColor(state.mana||"");
    el.className="card"; el.dataset.color=col; el.dataset.layout=state.layout;
    el.dataset.style=state.style||"modern"; el.dataset.foil=state.foil?"true":"false";
    const fid=(state.frame && state.frame!=="auto" && FRAMES[state.frame]) ? state.frame : autoFrame();
    if(fid && FRAMES[fid]){ el.dataset.frame="custom"; el.innerHTML=renderCustomFrame(FRAMES[fid]); }
    else { el.dataset.frame=""; el.innerHTML=(RENDERERS[state.layout]||RENDERERS.normal)(); }
    applyOverlays(el);
  } finally {
    Object.keys(snap).forEach(k=>{ state[k]=snap[k]; });
  }
};

/* barra de ações flutuante no mobile (prévia + exportar) */
(function(){
  const bar=document.getElementById("mobileBar"); if(!bar) return;
  const prev=document.getElementById("mbPreview"), exp=document.getElementById("mbExport");
  if(prev) prev.addEventListener("click",()=>{ const s=document.querySelector(".stage"); if(s) s.scrollIntoView({behavior:"smooth",block:"start"}); });
  if(exp)  exp.addEventListener("click",()=>{ const b=document.getElementById("btnExport"); if(b) b.click(); });
  const sv=document.getElementById("mbSave");
  if(sv) sv.addEventListener("click",()=>{ const b=document.getElementById("btnSaveTop"); if(b) b.click(); else if(window.ForgeLocal) window.ForgeLocal.saveCurrent(); else toast("Salvamento indisponível.",true); });
  const onScroll=()=>bar.classList.toggle("show", window.scrollY>440);
  window.addEventListener("scroll",onScroll,{passive:true}); onScroll();
})();

/* menu hamburguer (mobile) - recolhe os botoes da topbar num dropdown */
(function(){
  const tb = document.querySelector(".topbar");
  const toggle = document.getElementById("navToggle");
  const actions = document.getElementById("topbarActions");
  if(!tb || !toggle || !actions) return;
  const close = () => { tb.classList.remove("nav-open"); toggle.setAttribute("aria-expanded","false"); };
  const open  = () => { tb.classList.add("nav-open");  toggle.setAttribute("aria-expanded","true");  };
  toggle.addEventListener("click", (e) => { e.stopPropagation(); tb.classList.contains("nav-open") ? close() : open(); });
  actions.addEventListener("click", (e) => { if (e.target.closest("button")) close(); });
  document.addEventListener("click", (e) => { if (tb.classList.contains("nav-open") && !tb.contains(e.target)) close(); });
})();

/* ============================================================
   FOLHA DE IMPRESSÃO (proxies — 3×3, 63×88 mm, PDF via navegador)
   ============================================================ */
const printQueue = [];
const printModal = $("printModal");

$("btnPrint").addEventListener("click", ()=>{ printModal.hidden=false; renderPrintList(); });
$("printClose").addEventListener("click", ()=>{ printModal.hidden=true; });
printModal.addEventListener("click", e=>{ if(e.target===printModal) printModal.hidden=true; });
$("printAddCurrent").addEventListener("click", ()=>{
  const qty=Math.max(1, Math.min(99, parseInt($("printQty").value)||1));
  printQueue.push({ data: window.Forge.serialize(), qty, png:null });
  renderPrintList();
  toast("Carta adicionada à fila.");
});
$("printClear").addEventListener("click", ()=>{ printQueue.length=0; renderPrintList(); });
$("printGo").addEventListener("click", generateSheet);

function printTotals(){ const cards=printQueue.reduce((s,it)=>s+it.qty,0); return { cards, pages: Math.ceil(cards/9) }; }
function updatePrintSummary(){ const t=printTotals(); $("printSummary").textContent = t.cards ? `${t.cards} carta(s) · ${t.pages} página(s)` : ""; }

function renderPrintList(){
  const box=$("printList"); if(!box) return;
  if(!printQueue.length){ box.innerHTML=`<p class="hint" style="margin:0">Fila vazia. Adicione cartas para montar a folha.</p>`; updatePrintSummary(); return; }
  box.innerHTML="";
  printQueue.forEach((it,i)=>{
    const row=document.createElement("div"); row.className="print-row";
    row.innerHTML=`<div class="pthumb"><div class="card"></div></div>
      <div class="print-row-info"><b>${escapeHTML(it.data.name||"Sem nome")}</b><span>${escapeHTML(it.data.layout||"")}</span></div>
      <div class="qty"><button type="button" data-d="-1">−</button><span>${it.qty}</span><button type="button" data-d="1">+</button></div>
      <button type="button" class="print-del" title="remover">✕</button>`;
    window.Forge.previewInto(row.querySelector(".pthumb .card"), it.data);
    row.querySelector('[data-d="-1"]').onclick=()=>{ it.qty=Math.max(1,it.qty-1); renderPrintList(); };
    row.querySelector('[data-d="1"]').onclick=()=>{ it.qty=Math.min(99,it.qty+1); renderPrintList(); };
    row.querySelector(".print-del").onclick=()=>{ printQueue.splice(i,1); renderPrintList(); };
    box.appendChild(row);
  });
  updatePrintSummary();
}

async function cardToPng(data){
  const host=document.createElement("div");
  host.style.cssText="position:absolute;left:-10000px;top:0;";
  const el=document.createElement("div"); host.appendChild(el);
  document.body.appendChild(host);
  /* foil é efeito de tela: não sai na folha de impressão */
  window.Forge.previewInto(el, Object.assign({}, data, { foil:false }));
  el.dataset.foil="false";   // foil é só efeito de tela — não vai para a folha de impressão
  await new Promise(r=>setTimeout(r,80)); // deixa fontes/imagens assentarem
  let url="";
  try{ url=await htmlToImage.toPng(el,{pixelRatio:2,cacheBust:true,backgroundColor:null}); }
  finally{ document.body.removeChild(host); }
  return url;
}
async function ensurePng(it){ if(!it.png) it.png=await cardToPng(it.data); return it.png; }

function buildSheetHTML(images, paper, guides){
  const pageSize = paper==="letter" ? "Letter" : "A4";
  const border = guides ? "outline:0.25mm solid #888;outline-offset:-0.125mm;" : "";
  let pages="";
  for(let i=0;i<images.length;i+=9){
    const cells=images.slice(i,i+9).map(src=>`<div class="pc"><img src="${src}"></div>`).join("");
    pages+=`<section class="page"><div class="grid">${cells}</div></section>`;
  }
  return `<!doctype html><html lang="pt-br"><head><meta charset="utf-8">
  <title>Folha de impressão — Forja de Cartas</title>
  <style>
    @page { size: ${pageSize}; margin: 8mm; }
    * { box-sizing: border-box; }
    html,body { margin:0; padding:0; background:#fff; }
    .page { display:flex; align-items:center; justify-content:center; page-break-after:always; break-after:page; }
    .page:last-child { page-break-after:auto; break-after:auto; }
    .grid { display:grid; grid-template-columns: repeat(3,63mm); grid-template-rows: repeat(3,88mm); }
    .pc { width:63mm; height:88mm; overflow:hidden; ${border} }
    .pc img { width:63mm; height:88mm; object-fit:cover; display:block; }
    @media screen { body{ background:#3a3a3a; padding:18px; } .page{ background:#fff; margin:0 auto 18px; box-shadow:0 6px 24px rgba(0,0,0,.45);} }
  </style></head>
  <body onload="setTimeout(function(){window.focus();window.print();},350)">${pages}</body></html>`;
}

function generateSheet(){
  if(!printQueue.length) return toast("Adicione cartas à fila primeiro.",true);
  const paper=$("printPaper").value, guides=$("printGuides").checked;
  const w=window.open("","_blank");
  if(!w) return toast("Permita pop-ups para gerar a folha.",true);
  w.document.write("<!doctype html><meta charset=utf-8><body style='font-family:sans-serif;padding:24px;color:#333'>Gerando folha…</body>");
  toast("Renderizando cartas…");
  (async()=>{
    try{
      const imgs=[];
      for(const it of printQueue){ const png=await ensurePng(it); for(let k=0;k<it.qty;k++) imgs.push(png); }
      w.document.open(); w.document.write(buildSheetHTML(imgs,paper,guides)); w.document.close();
      toast("Folha pronta — escolha Salvar como PDF.");
    }catch(e){ try{ w.document.body.innerHTML="Erro ao gerar: "+e.message; }catch(_){} toast("Falha ao gerar folha.",true); }
  })();
}

/* ponte para outras partes (ex.: imprimir uma coleção inteira) */
window.ForgePrint = {
  add(data, qty){ if(data) printQueue.push({ data, qty: Math.max(1, Math.min(99, qty||1)), png:null }); },
  clear(){ printQueue.length=0; },
  open(){ printModal.hidden=false; renderPrintList(); }
};

/* cor efetiva da carta (resolve "auto" a partir do custo) — usado nos filtros da galeria */
window.Forge.colorOf = function(data){
  if(!data) return "multi";
  const c = data.color;
  if(c && c !== "auto") return c;
  try { return autoColor(data.mana || ""); } catch(e){ return "multi"; }
};
/* ============================================================
   AUTO-SAVE RECOVERY
   ============================================================ */
window.addEventListener("DOMContentLoaded", () => {
  // Restaura o rascunho da sessao anterior ANTES de habilitar a gravacao, para
  // que o render() do boot (carta padrao) nao o sobrescreva antes de o lermos.
  const saved = localStorage.getItem("forja_autosave");
  if (saved) {
    try {
      window.Forge.load(JSON.parse(saved));
      if (typeof toast === "function") toast("Rascunho restaurado.");
    } catch(e) {
      console.error("Erro ao carregar o rascunho salvo.", e);
    }
  }
  window.__autosaveReady = true;
  saveDraft();
});


/* ============================================================
   MELHORIAS DE UX (lote)
   ============================================================ */

/* indicador de auto-save */
let __saveFlashT=null;
function flashSaved(){
  const el=document.getElementById("saveStatus"); if(!el) return;
  el.textContent="✓ rascunho salvo"; el.classList.add("show");
  clearTimeout(__saveFlashT);
  __saveFlashT=setTimeout(()=>el.classList.remove("show"),1600);
}

/* Nova carta (em branco) */
function newCard(){
  Object.assign(state,{
    layout:"normal", color:"auto", name:"", mana:"", type:"", rules:"", flavor:"", pt:"",
    rarity:"incomum", artist:"você", collector:"001/250", art:"", backArt:"",
    loyalty:"4", defense:"5", pw:[], saga:[], cls:[],
    adv:{name:"",mana:"",type:"",rules:""}, split:{name:"",mana:"",type:"",rules:""},
    back:{name:"",mana:"",type:"",rules:"",flavor:"",pt:""},
    showBack:false, frame:"auto", style:"modern", foil:false, frameEdit:null, overlays:[],
    setIcon:"", setIconTints:null
  });
  $("fLayout").value="normal";
  populate(); applyLayoutVisibility(); renderRows(); renderOvList(); refreshSetIconUI(); render();
}
(function(){ const b=$("btnNew"); if(b) b.addEventListener("click",()=>{
  if(!confirm("Começar uma carta nova em branco? Isto substitui a carta atual — o que não estiver salvo será perdido.")) return;
  newCard(); toast("Carta nova.");
}); })();

/* ===== PALETA DE MANA: cobre todos os tipos de pip e insere a sintaxe certa ===== */
/* cada grupo: {label, codes:[...]}. Cores/X/S/C inseridos "soltos"; compostos entre {chaves}. */
const MANA_PALETTE=[
  {label:"Cores",            codes:["W","U","B","R","G","C"]},
  {label:"Genérico/Especial",codes:["X","S"]},
  {label:"Híbrido de cor",   codes:["W/U","W/B","U/B","U/R","B/R","B/G","R/G","R/W","G/W","G/U"]},
  {label:"Híbrido genérico", codes:["2/W","2/U","2/B","2/R","2/G"]},
  {label:"Phyrexian",        codes:["W/P","U/P","B/P","R/P","G/P"]},
  {label:"Híbrido Phyrexian",codes:["W/U/P","W/B/P","U/B/P","U/R/P","B/G/P","B/R/P","G/U/P","G/W/P","R/G/P","R/W/P"]},
  {label:"Híbrido incolor",  codes:["C/W","C/U","C/B","C/R","C/G"]},
];
/* incrementa a mana genérica (bare "2…" ou "{2}…"), senão insere 1 no início */
function manaAddGeneric(v){
  v=v.trim();
  let m=v.match(/^\{(\d+)\}/);  if(m) return "{"+(+m[1]+1)+"}"+v.slice(m[0].length);
  m=v.match(/^(\d+)/);          if(m) return (+m[1]+1)+v.slice(m[1].length);
  return (v.includes("{")?"{1}":"1")+v;
}
function buildManaPalette(){
  const box=$("manaPips"); if(!box) return;
  const isSingle=c=>/^[WUBRGCXST]$/.test(c);
  let html=`<div class="mp-row mp-actions">
      <button type="button" class="mp-btn mp-gen" data-act="gen" title="+1 genérico">＋1</button>
      <button type="button" class="mp-btn mp-clear" data-act="clear">limpar</button>
    </div>`;
  html+=MANA_PALETTE.map(g=>`<div class="mp-group"><span class="mp-glabel">${g.label}</span><div class="mp-row">`+
    g.codes.map(c=>{
      const ins=isSingle(c)?c:`{${c}}`;
      return `<button type="button" class="mp-btn mp-sym" data-ins="${ins}" title="${c}">${pipSpan(c)}</button>`;
    }).join("")+`</div></div>`).join("");
  box.innerHTML=html;
}
(function(){
  const box=$("manaPips"), fm=$("fMana"); if(!box||!fm) return;
  buildManaPalette();
  box.addEventListener("click",(e)=>{
    const b=e.target.closest("button"); if(!b) return;
    if(b.dataset.act==="clear"){ fm.value=""; }
    else if(b.dataset.act==="gen"){ fm.value=manaAddGeneric(fm.value); }
    else if(b.dataset.ins!=null){ fm.value=fm.value+b.dataset.ins; }
    collect(); render();
  });
})();

/* colar imagem da área de transferência -> arte */
document.addEventListener("paste",(e)=>{
  const items=(e.clipboardData||{}).items||[];
  for(const it of items){ if(it.type && it.type.startsWith("image/")){ const f=it.getAsFile(); if(f){ readFile(f,false); toast("Imagem colada como arte."); } return; } }
});

/* autocomplete do Scryfall (datalist) */
(function(){
  const inp=$("scryName"), dl=$("scryAC"); if(!inp||!dl) return;
  let t=null, last="";
  inp.addEventListener("input",()=>{
    const q=inp.value.trim(); if(q.length<2||q===last) return; last=q;
    clearTimeout(t); t=setTimeout(async()=>{
      try{
        const r=await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
        if(!r.ok) return; const j=await r.json();
        dl.innerHTML=(j.data||[]).map(n=>`<option value="${String(n).replace(/"/g,"&quot;")}"></option>`).join("");
      }catch(_){}
    },220);
  });
})();

/* atalhos de teclado: Ctrl/Cmd+S = Salvar, Ctrl/Cmd+E = Exportar */
document.addEventListener("keydown",(e)=>{
  const k=(e.key||"").toLowerCase();
  if((e.ctrlKey||e.metaKey)&&k==="s"){ e.preventDefault(); const sb=document.getElementById("btnSaveTop"); if(sb) sb.click(); else if(window.ForgeLocal) window.ForgeLocal.saveCurrent(); else toast("Salvamento indisponível.",true); }
  else if((e.ctrlKey||e.metaKey)&&k==="e"){ e.preventDefault(); const ex=document.getElementById("btnExport"); if(ex) ex.click(); }
});

/* ESC fecha o modal/painel aberto no topo */
document.addEventListener("keydown",(e)=>{
  if(e.key!=="Escape") return;
  const open=[...document.querySelectorAll(".fmodal, .fdrawer, .fgallery")].filter(n=>!n.hidden);
  if(!open.length) return;
  const top=open[open.length-1];
  const x=top.querySelector(".fmodal-x, [data-closed]");
  if(x) x.click(); else top.hidden=true;
});


/* ============================================================
   HERO da home — cartas reais flutuando atrás de vidro fosco
   ============================================================ */
(function(){
  const wrap=document.getElementById("heroCards");
  const start=document.getElementById("heroStart");
  if(start) start.addEventListener("click",()=>{ const m=document.querySelector("main.layout"); if(m) m.scrollIntoView({behavior:"smooth",block:"start"}); });
  if(!wrap) return;
  /* visitantes recorrentes: hero compacto (o editor fica a um toque) */
  const hero=document.getElementById("hero");
  try{
    if(localStorage.getItem("forge_hero_seen")) hero.classList.add("hero-compact");
    else localStorage.setItem("forge_hero_seen","1");
  }catch(_){}
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const w=window.innerWidth;
  const N = w<640 ? 6 : (w<1100 ? 10 : 16);   /* desktop largo = mais cartas */

  async function randomCardImage(){
    const q="is:hires -is:funny game:paper lang:en";
    const r=await fetch(`https://api.scryfall.com/cards/random?q=${encodeURIComponent(q)}`,{headers:{Accept:"application/json"}});
    if(!r.ok) throw new Error("scryfall "+r.status);
    const j=await r.json();
    const iu=j.image_uris||(j.card_faces&&j.card_faces[0]&&j.card_faces[0].image_uris);
    return iu ? (iu.normal||iu.large||iu.png) : null;
  }

  (async()=>{
    for(let i=0;i<N;i++){
      try{
        const src=await randomCardImage(); if(!src) continue;
        const img=new Image();
        img.alt=""; img.loading="lazy"; img.decoding="async"; img.referrerPolicy="no-referrer";
        img.className="hero-card";
        img.style.left=(2+Math.random()*84)+"%";
        img.style.top=(Math.random()*74)+"%";
        if(w>=640) img.style.width=(150+Math.random()*85).toFixed(0)+"px";  /* tamanhos variados = profundidade */
        img.style.setProperty("--rot",(Math.random()*26-13).toFixed(1)+"deg");
        img.style.setProperty("--drift",(18+Math.random()*22).toFixed(0)+"px");
        img.style.animationDuration=(16+Math.random()*12).toFixed(1)+"s";
        img.style.animationDelay=(-Math.random()*14).toFixed(1)+"s";
        if(reduce) img.style.animation="none";
        img.addEventListener("load",()=>img.classList.add("on"));
        img.src=src;
        wrap.appendChild(img);
      }catch(_){ /* sem rede / Scryfall fora: o hero fica só com o gradiente */ }
      await new Promise(res=>setTimeout(res,140));   /* gentileza com a API (rate limit) */
    }
  })();
})();


/* "Salvar" junto da carta (a topbar some ao rolar; este fica sempre por perto) */
(function(){
  const p=document.getElementById("btnSaveProxy"); if(!p) return;
  p.addEventListener("click",()=>{ const b=document.getElementById("btnSaveTop"); if(b) b.click(); else if(window.ForgeLocal) window.ForgeLocal.saveCurrent(); else toast("Salvamento indisponível.",true); });
})();
