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
  art: "", backArt: "",
  loyalty: "4", defense: "5",
  pw: [], saga: [], cls: [],
  adv: { name:"", mana:"", type:"", rules:"" },
  split: { name:"", mana:"", type:"", rules:"" },
  back: { name:"", mana:"", type:"", rules:"", flavor:"", pt:"" },
  showBack: false,
};

/* ---------- utilidades de render ---------- */
function escapeHTML(s){return (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function pips(str){
  const out=[]; const raw=(str||"").toUpperCase().trim();
  const tokens=raw.match(/\d+|[WUBRGCXS]/g)||[];
  for(const t of tokens){
    if(/^\d+$/.test(t)) out.push(`<span class="pip pip-N">${t}</span>`);
    else out.push(`<span class="pip pip-${t}">${t}</span>`);
  }
  return out.join("");
}
function autoColor(mana){
  const c=[...new Set((mana.toUpperCase().match(/[WUBRG]/g))||[])];
  if(c.length===0) return "C"; if(c.length===1) return c[0]; return "multi";
}
function rulesHTML(text){
  let h=escapeHTML(text);
  h=h.replace(/\(([^)]+)\)/g,'<span class="reminder">($1)</span>');
  return h;
}
const SYM={comum:"●",incomum:"◆",rara:"★","mítica":"✦"};
function setSym(r){return `<span class="c-set r-${r}">${SYM[r]||"◆"}</span>`;}
function credit(){const a=escapeHTML(state.artist.trim()||"—");const c=escapeHTML(state.collector.trim());return `illus. ${a}${c?" · "+c:""}`;}

/* peças reutilizáveis */
function elArt(url,cls){
  if(url) return `<div class="art-window ${cls||""}"><img src="${url}" alt=""></div>`;
  return `<div class="art-window ${cls||""}"><div class="art-ph"><span>⛰</span></div></div>`;
}
function titleBar(name,mana){
  return `<div class="title-bar"><span class="c-name">${escapeHTML(name||"Sem nome")}</span><span class="c-mana">${pips(mana)}</span></div>`;
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
function renderNormal(d){ // criatura/mágica/artefato/encantamento/token/dfc-face
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
  return `<div class="card-frame token">
    <div class="title-bar"><span class="c-name">${escapeHTML(state.name||"Sem nome")}</span><span class="c-mana">${pips(state.mana)}</span></div>
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
      <div class="adv-title"><span class="adv-name">${escapeHTML(a.name||"Aventura")}</span><span class="c-mana">${pips(a.mana)}</span></div>
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
      <div class="title-bar"><span class="c-name">${escapeHTML(state.name||"")}</span><span class="c-mana">${pips(state.mana)}</span></div>
      <div class="type-bar"><span class="c-type">${escapeHTML(state.type||"")}</span></div>
      <div class="text-box"><div class="c-rules">${rulesHTML(state.rules)}</div></div>
    </div>`;
  const s=state.split;
  const right=`<div class="split-half">
      <div class="title-bar"><span class="c-name">${escapeHTML(s.name||"")}</span><span class="c-mana">${pips(s.mana)}</span></div>
      <div class="type-bar"><span class="c-type">${escapeHTML(s.type||"")}</span></div>
      <div class="text-box"><div class="c-rules">${rulesHTML(s.rules)}</div></div>
    </div>`;
  return `<div class="card-frame split">${left}<div class="split-div"></div>${right}</div>`;
}

const RENDERERS={normal:()=>renderNormal({name:state.name,mana:state.mana,type:state.type,rules:state.rules,flavor:state.flavor,pt:state.pt,art:state.art,rarity:state.rarity}),
  land:renderLand,token:renderToken,planeswalker:renderPlaneswalker,saga:renderSaga,
  class:renderClass,battle:renderBattle,adventure:renderAdventure,emblem:renderEmblem,dfc:renderDFC,split:renderSplit};

function render(){
  let col=state.color; if(col==="auto") col=autoColor(state.layout==="dfc"&&state.showBack?state.back.mana:state.mana);
  card.dataset.color=col; card.dataset.layout=state.layout;
  card.innerHTML=(RENDERERS[state.layout]||RENDERERS.normal)();
  $("btnFlip").hidden = state.layout!=="dfc";
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
  state.color=$("fColor").value;
  state.rarity=$("fRarity").value;
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
  $("fLayout").value=state.layout; $("fColor").value=state.color; $("fRarity").value=state.rarity;
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
const mainInputs=["fName","fMana","fType","fRules","fFlavor","fPT","fColor","fRarity","fArtist","fCollector",
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
  const btn=$("btnAiCard"); spin(btn,true);
  try{
    const res=await fetch("/api/generate-card",{method:"POST",headers:{"Content-Type":"application/json"},
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
  const btn=$("btnAiArt"); spin(btn,true);
  try{
    const res=await fetch("/api/generate-art",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})});
    if(!res.ok) throw new Error((await res.json().catch(()=>({}))).error||`Erro ${res.status}`);
    const d=await res.json(); if(d.image) setArt(d.image, state.layout==="dfc"&&state.showBack); else throw new Error("Resposta sem imagem.");
    toast("Arte gerada!");
  }catch(err){toast(err.message,true);} finally{spin(btn,false);}
});

/* ============================================================
   EXPORTAR PNG
   ============================================================ */
$("btnExport").addEventListener("click",async()=>{
  try{ toast("Renderizando…");
    const url=await htmlToImage.toPng(card,{pixelRatio:2,cacheBust:true,backgroundColor:null});
    const a=document.createElement("a");
    const safe=(state.name||"carta").replace(/[^\w\-]+/g,"_").toLowerCase();
    a.download=`${safe}${state.layout==="dfc"?(state.showBack?"_verso":"_frente"):""}.png`; a.href=url; a.click();
    toast("PNG exportado!");
  }catch(err){toast("Falha ao exportar: "+err.message,true);}
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
$("btnRandom").addEventListener("click",()=>{
  const s=SAMPLES[Math.floor(Math.random()*SAMPLES.length)];
  Object.assign(state,{name:"",mana:"",type:"",rules:"",flavor:"",pt:"",loyalty:"4",defense:"5",pw:[],saga:[],cls:[],
    adv:{name:"",mana:"",type:"",rules:""},color:"auto",rarity:"incomum",artist:"você",collector:"001/250"});
  Object.assign(state,s); state.showBack=false; $("fLayout").value=state.layout;
  populate(); applyLayoutVisibility(); renderRows(); render(); toast("Exemplo carregado.");
});

/* ============================================================
   TOAST + INIT
   ============================================================ */
let tt; function toast(msg,err=false){const t=$("toast");t.textContent=msg;t.classList.toggle("err",err);t.classList.add("show");clearTimeout(tt);tt=setTimeout(()=>t.classList.remove("show"),2600);}

/* estado inicial = o que está nos campos */
collect(); applyLayoutVisibility(); renderRows(); render();
