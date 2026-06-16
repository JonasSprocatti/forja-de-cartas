/* @ds-bundle: {"format":3,"namespace":"ForjaDeCartasDesignSystem_e2faf4","components":[{"name":"Card","sourcePath":"components/card/Card.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"RarityGem","sourcePath":"components/core/RarityGem.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Dropzone","sourcePath":"components/forms/Dropzone.jsx"},{"name":"FieldLabel","sourcePath":"components/forms/FieldLabel.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"TextField","sourcePath":"components/forms/TextField.jsx"},{"name":"Toggle","sourcePath":"components/forms/Toggle.jsx"},{"name":"ManaCost","sourcePath":"components/mana/ManaCost.jsx"},{"name":"ManaPip","sourcePath":"components/mana/ManaPip.jsx"}],"sourceHashes":{"components/card/Card.jsx":"c80c72422848","components/core/Badge.jsx":"ccf1b1c2fbab","components/core/Button.jsx":"514cd9cbcf0a","components/core/RarityGem.jsx":"a08c3187d273","components/feedback/Toast.jsx":"42e22e32b6da","components/forms/Dropzone.jsx":"1955fe57b5ae","components/forms/FieldLabel.jsx":"c11d16f834aa","components/forms/SegmentedControl.jsx":"a5729c6c8cba","components/forms/Select.jsx":"551eb6cc0c21","components/forms/TextField.jsx":"f3c25de48dc5","components/forms/Toggle.jsx":"006a077db0b8","components/mana/ManaCost.jsx":"2cd7a7ca4d44","components/mana/ManaPip.jsx":"003f1498bf23","ui_kits/forge/CardBackground.jsx":"20cba1dd3950","ui_kits/forge/ForgeEditor.jsx":"a324c8b549ca","ui_kits/forge/Gallery.jsx":"dcf0e88178da","ui_kits/forge/Header.jsx":"dde6d637baf3","ui_kits/forge/Landing.jsx":"8edfe8e65859"},"inlinedExternals":[],"unexposedExports":[{"name":"parseManaCost","sourcePath":"components/mana/ManaCost.jsx"}]} */

(() => {

const __ds_ns = (window.ForjaDeCartasDesignSystem_e2faf4 = window.ForjaDeCartasDesignSystem_e2faf4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Badge — a small status / label pill.
 * `gold` for VIP-style emphasis, `pub`/`priv` for visibility state,
 * `neutral` for a plain outlined tag.
 */
function Badge({
  variant = "neutral",
  children,
  className = "",
  ...rest
}) {
  const cls = `fdc-badge fdc-badge--${variant} ${className}`.trim();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — the forge's primary action control.
 * Three brand variants: gold (primary), ghost (secondary), rune (AI / arcane).
 * Renders an <a> when `href` is supplied, otherwise a <button>.
 */
function Button({
  variant = "gold",
  size = "md",
  block = false,
  disabled = false,
  href,
  icon,
  children,
  className = "",
  ...rest
}) {
  const cls = ["fdc-btn", `fdc-btn--${variant}`, size === "sm" && "fdc-btn--sm", size === "lg" && "fdc-btn--lg", block && "fdc-btn--block", disabled && "fdc-btn--disabled", className].filter(Boolean).join(" ");
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, icon ? /*#__PURE__*/React.createElement("span", {
    className: "fdc-btn-icon",
    "aria-hidden": "true"
  }, icon) : null, children);
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      className: cls,
      href: href
    }, rest), content);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    className: cls,
    type: rest.type || "button",
    disabled: disabled
  }, rest), content);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/RarityGem.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GLYPH = {
  comum: "●",
  common: "●",
  incomum: "◆",
  uncommon: "◆",
  rara: "★",
  rare: "★",
  mítica: "✦",
  mitica: "✦",
  mythic: "✦"
};
const LABEL = {
  comum: "Comum",
  common: "Common",
  incomum: "Incomum",
  uncommon: "Uncommon",
  rara: "Rara",
  rare: "Rare",
  mítica: "Mítica",
  mitica: "Mítica",
  mythic: "Mythic"
};

/**
 * RarityGem — the set/expansion symbol whose colour encodes rarity.
 * ● common (ink) · ◆ uncommon (silver) · ★ rare (gold) · ✦ mythic (ember).
 */
function RarityGem({
  rarity = "incomum",
  className = "",
  ...rest
}) {
  const key = String(rarity).toLowerCase();
  const glyph = GLYPH[key] || GLYPH.incomum;
  const cls = `fdc-rarity fdc-rarity--${key} ${className}`.trim();
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    role: "img",
    "aria-label": LABEL[key] || rarity
  }, rest), glyph);
}
Object.assign(__ds_scope, { RarityGem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/RarityGem.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toast — a brass-bordered status message. `type` sets the accent:
 * neutral (brass), ok (green), err (ember).
 */
function Toast({
  type = "neutral",
  icon,
  children,
  className = "",
  ...rest
}) {
  const cls = ["fdc-toast", type === "ok" && "fdc-toast--ok", type === "err" && "fdc-toast--err", className].filter(Boolean).join(" ");
  const fallbackIcon = type === "ok" ? "✓" : type === "err" ? "⚠" : "✦";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "status",
    "aria-live": "polite"
  }, rest), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, icon || fallbackIcon), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Dropzone.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Dropzone — a dashed drop target for images (card art, overlays).
 * Visual only by default; wire `onFiles` to handle dropped/selected files.
 */
function Dropzone({
  icon = "↥",
  label = "Clique ou arraste uma imagem aqui",
  small = false,
  accept = "image/*",
  onFiles,
  className = "",
  ...rest
}) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const cls = ["fdc-dropzone", small && "fdc-dropzone--sm", drag && "is-drag", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("label", _extends({
    className: cls,
    onDragOver: e => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: e => {
      e.preventDefault();
      setDrag(false);
      if (onFiles && e.dataTransfer.files) onFiles(e.dataTransfer.files);
    }
  }, rest), /*#__PURE__*/React.createElement("input", {
    ref: inputRef,
    type: "file",
    accept: accept,
    hidden: true,
    onChange: e => onFiles && onFiles(e.target.files)
  }), /*#__PURE__*/React.createElement("span", {
    className: "fdc-dz-icon",
    "aria-hidden": "true"
  }, icon), /*#__PURE__*/React.createElement("span", {
    className: "fdc-dz-text"
  }, label));
}
Object.assign(__ds_scope, { Dropzone });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Dropzone.jsx", error: String((e && e.message) || e) }); }

// components/forms/FieldLabel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FieldLabel — the engraved Cinzel uppercase eyebrow that labels every
 * control in the forge panel.
 */
function FieldLabel({
  children,
  htmlFor,
  className = "",
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", _extends({
    className: `fdc-field-label ${className}`.trim(),
    htmlFor: htmlFor
  }, rest), children);
}
Object.assign(__ds_scope, { FieldLabel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FieldLabel.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SegmentedControl — the brass "mode switch". Pick one option from a small
 * set (e.g. ✎ Preencher campos / ✨ Deixar a IA criar).
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  block = false,
  className = "",
  ...rest
}) {
  const items = options.map(o => typeof o === "object" ? o : {
    value: o,
    label: o
  });
  const cls = ["fdc-seg", block && "fdc-seg--block", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "tablist"
  }, rest), items.map(o => /*#__PURE__*/React.createElement("button", {
    key: o.value,
    type: "button",
    role: "tab",
    "aria-selected": value === o.value,
    className: `fdc-seg-btn ${value === o.value ? "is-active" : ""}`.trim(),
    onClick: () => onChange && onChange(o.value)
  }, o.icon ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, o.icon) : null, o.label)));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Select — a styled dropdown with the brass chevron. Provide `options`
 * as [{value, label}] or simple strings, or pass <option> children.
 */
function Select({
  label,
  hint,
  options,
  id,
  children,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? `s-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const opts = options && options.map((o, i) => {
    const value = typeof o === "object" ? o.value : o;
    const text = typeof o === "object" ? o.label : o;
    return /*#__PURE__*/React.createElement("option", {
      key: i,
      value: value
    }, text);
  });
  const select = /*#__PURE__*/React.createElement("select", _extends({
    id: fieldId,
    className: "fdc-select"
  }, rest), opts || children);
  if (!label && !hint) return select;
  return /*#__PURE__*/React.createElement("div", {
    className: `fdc-field ${className}`.trim()
  }, label ? /*#__PURE__*/React.createElement(__ds_scope.FieldLabel, {
    htmlFor: fieldId
  }, label) : null, select, hint ? /*#__PURE__*/React.createElement("p", {
    className: "fdc-hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * TextField — a labelled text control (single or multi-line) with an
 * optional italic hint. The standard building block of the forge panel.
 */
function TextField({
  label,
  hint,
  multiline = false,
  rows = 4,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? `f-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    className: `fdc-field ${className}`.trim()
  }, label ? /*#__PURE__*/React.createElement(__ds_scope.FieldLabel, {
    htmlFor: fieldId
  }, label) : null, multiline ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    className: "fdc-textarea",
    rows: rows
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: "fdc-input",
    type: rest.type || "text"
  }, rest)), hint ? /*#__PURE__*/React.createElement("p", {
    className: "fdc-hint"
  }, hint) : null);
}
Object.assign(__ds_scope, { TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Toggle — an on/off button. When on, it lights up with the holographic
 * "foil" gradient. Used for the Foil finish and similar binary settings.
 */
function Toggle({
  on = false,
  onChange,
  children,
  icon = "✦",
  className = "",
  ...rest
}) {
  const cls = ["fdc-toggle", on && "is-on", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls,
    "aria-pressed": on,
    onClick: e => {
      onChange && onChange(!on);
      rest.onClick && rest.onClick(e);
    }
  }, rest), icon ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, icon) : null, children);
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/mana/ManaPip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * ManaPip — a single coloured mana symbol, rendered as the forge's
 * original glossy circular "pip". Pass a symbol: a colour letter
 * (W U B R G C), a generic number, X, or a special (T tap, E energy, P phyrexian).
 */
function ManaPip({
  symbol,
  size = "md",
  className = "",
  ...rest
}) {
  const raw = String(symbol == null ? "" : symbol).trim().toUpperCase();

  // map the symbol to a colour class + the glyph shown inside the pip
  let kind = "C"; // generic / colourless fallback
  let label = raw;
  if (/^\d+$/.test(raw)) {
    kind = "C";
    label = raw; // generic mana number
  } else if (raw === "X" || raw === "Y" || raw === "Z") {
    kind = "X";
    label = raw;
  } else if (raw === "T" || raw === "TAP") {
    kind = "T";
    label = "↷";
  } else if (raw === "E") {
    kind = "E";
    label = "⚡";
  } else if (raw === "P") {
    kind = "P";
    label = "Φ";
  } else if (["W", "U", "B", "R", "G", "C"].includes(raw)) {
    kind = raw;
    label = raw;
  } else {
    kind = "C";
    label = raw;
  }
  const cls = ["fdc-pip", `fdc-pip--${kind}`, size === "sm" && "fdc-pip--sm", size === "lg" && "fdc-pip--lg", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    role: "img",
    "aria-label": `${raw} mana`
  }, rest), label);
}
Object.assign(__ds_scope, { ManaPip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mana/ManaPip.jsx", error: String((e && e.message) || e) }); }

// components/mana/ManaCost.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Parse a mana-cost string into an array of symbols.
 * Accepts compact form ("2WU", "XR") and braced form ("{2}{W}{U}", "{W/U}").
 * Braced tokens are kept whole; in compact form digits group into one
 * generic number and each letter becomes its own pip.
 */
function parseManaCost(cost) {
  const out = [];
  const str = String(cost == null ? "" : cost).trim();
  if (!str) return out;
  if (str.includes("{")) {
    const re = /\{([^}]+)\}/g;
    let m;
    while (m = re.exec(str)) out.push(m[1].trim());
    return out;
  }
  // compact: digits clump, letters are individual
  let num = "";
  for (const ch of str) {
    if (/\d/.test(ch)) {
      num += ch;
    } else if (/[a-zA-Z]/.test(ch)) {
      if (num) {
        out.push(num);
        num = "";
      }
      out.push(ch);
    }
    // ignore spaces / separators
  }
  if (num) out.push(num);
  return out;
}

/**
 * ManaCost — a row of mana pips parsed from a cost string.
 * The forge's defining inline element.
 */
function ManaCost({
  cost,
  symbols,
  size = "md",
  className = "",
  ...rest
}) {
  const list = symbols && symbols.length ? symbols : parseManaCost(cost);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `fdc-manacost ${className}`.trim()
  }, rest), list.map((s, i) => /*#__PURE__*/React.createElement(__ds_scope.ManaPip, {
    key: i,
    symbol: s,
    size: size
  })));
}
Object.assign(__ds_scope, { parseManaCost, ManaCost });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/mana/ManaCost.jsx", error: String((e && e.message) || e) }); }

// components/card/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const COLOR_LETTERS = ["W", "U", "B", "R", "G"];

/** Real frame PNGs (transparent art window) from the upstream repo. */
const FRAME_FILE = {
  W: "W-Basic.png",
  U: "U-Basic.png",
  B: "B-Basic.png",
  R: "R-Basic.png",
  G: "G-Basic.png",
  C: "C-Basic.png",
  multi: "Golden-Basic.png"
};
/** Percentage-positioned zones shared by the basic frames (see frames.json). */
const ZONES = {
  art: {
    left: "6.25%",
    top: "14.3%",
    width: "87.5%",
    height: "37.8%"
  },
  name: {
    left: "6%",
    top: "4.2%",
    width: "57%",
    height: "8%"
  },
  mana: {
    left: "62%",
    top: "4.2%",
    width: "32%",
    height: "8%"
  },
  type: {
    left: "6.5%",
    top: "53.3%",
    width: "81%",
    height: "7%"
  },
  text: {
    left: "6.5%",
    top: "63.5%",
    width: "87%",
    height: "27%"
  },
  pt: {
    left: "75.5%",
    top: "91%",
    width: "18.5%",
    height: "7.5%"
  },
  credit: {
    left: "6%",
    top: "93.3%",
    width: "60%",
    height: "4.5%"
  }
};

/** Guess the frame colour from a mana-cost string. */
function colorFromCost(cost) {
  const found = COLOR_LETTERS.filter(c => new RegExp(c, "i").test(String(cost || "")));
  if (found.length === 0) return "C";
  if (found.length === 1) return found[0];
  return "multi";
}

/** Render rules text: parenthetical "(reminder)" italic + inline {X} mana pips. */
function renderRules(text) {
  if (!text) return null;
  const lines = String(text).split("\n");
  return lines.map((line, li) => {
    const parts = [];
    // split on {X} tokens and (reminder) groups
    const token = /(\{[^}]+\})|(\([^)]*\))/g;
    let last = 0;
    let m;
    let key = 0;
    while (m = token.exec(line)) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[1]) {
        parts.push(/*#__PURE__*/React.createElement(__ds_scope.ManaPip, {
          key: `p${li}-${key++}`,
          symbol: m[1].slice(1, -1),
          size: "sm"
        }));
      } else if (m[2]) {
        parts.push(/*#__PURE__*/React.createElement("span", {
          key: `r${li}-${key++}`,
          className: "reminder"
        }, m[2]));
      }
      last = token.lastIndex;
    }
    if (last < line.length) parts.push(line.slice(last));
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: li
    }, parts, li < lines.length - 1 ? /*#__PURE__*/React.createElement("br", null) : null);
  });
}

/**
 * Card — the original fantasy-card frame (standard layout).
 * The centrepiece of Forja de Cartas: title bar with mana cost, art window,
 * type line with rarity gem, parchment rules/flavor box, and bottom bar with
 * credit + power/toughness.
 */
function Card({
  name = "Carta sem nome",
  manaCost = "",
  type = "",
  art,
  rules = "",
  flavor = "",
  pt = "",
  rarity = "incomum",
  color = "auto",
  foil = false,
  frame = false,
  frameBase = "assets/frames/",
  artist = "você",
  collector = "001/250",
  size = "md",
  tilt = false,
  className = "",
  ...rest
}) {
  const resolved = color === "auto" ? colorFromCost(manaCost) : color;

  // ---- image-frame mode: real PNG frame with percentage-positioned zones ----
  if (frame) {
    const fkey = frame === true || frame === "auto" ? resolved : frame;
    const file = FRAME_FILE[fkey] || FRAME_FILE.multi;
    const fcls = ["fdc-card", "fdc-card--framed", size === "sm" && "fdc-card--sm", size === "xs" && "fdc-card--xs", tilt && "fdc-card--tilt", className].filter(Boolean).join(" ");
    return /*#__PURE__*/React.createElement("div", _extends({
      className: fcls,
      "data-color": fkey,
      "data-foil": foil ? "true" : undefined
    }, rest), /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-art",
      style: ZONES.art
    }, art ? /*#__PURE__*/React.createElement("img", {
      src: art,
      alt: name
    }) : /*#__PURE__*/React.createElement("span", {
      className: "fdc-cf-art-ph"
    }, /*#__PURE__*/React.createElement("span", {
      className: "fdc-cf-art-ph-ico"
    }, "\u26F0"), /*#__PURE__*/React.createElement("span", {
      className: "fdc-cf-art-ph-txt"
    }, "sem arte"))), /*#__PURE__*/React.createElement("img", {
      className: "fdc-cf-frame",
      src: `${frameBase}${file}`,
      alt: "",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-zone--top fdc-cf-name",
      style: ZONES.name
    }, name), /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-zone--top fdc-cf-mana",
      style: ZONES.mana
    }, manaCost ? /*#__PURE__*/React.createElement(__ds_scope.ManaCost, {
      cost: manaCost
    }) : null), type ? /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-type",
      style: ZONES.type
    }, /*#__PURE__*/React.createElement("span", null, type), /*#__PURE__*/React.createElement(__ds_scope.RarityGem, {
      rarity: rarity
    })) : null, /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-text",
      style: ZONES.text
    }, /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-rules"
    }, renderRules(rules)), flavor ? /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-flavor"
    }, flavor) : null), pt ? /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-pt",
      style: ZONES.pt
    }, pt) : null, /*#__PURE__*/React.createElement("div", {
      className: "fdc-cf-zone fdc-cf-credit",
      style: ZONES.credit
    }, "\u269C ", artist, " \xB7 ", collector));
  }
  const cls = ["fdc-card", size === "sm" && "fdc-card--sm", size === "xs" && "fdc-card--xs", tilt && "fdc-card--tilt", className].filter(Boolean).join(" ");
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    "data-color": resolved,
    "data-foil": foil ? "true" : undefined
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "fdc-card-frame"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fdc-title-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fdc-c-name"
  }, name), manaCost ? /*#__PURE__*/React.createElement(__ds_scope.ManaCost, {
    cost: manaCost
  }) : null), /*#__PURE__*/React.createElement("div", {
    className: "fdc-art-window"
  }, art ? /*#__PURE__*/React.createElement("img", {
    src: art,
    alt: name
  }) : /*#__PURE__*/React.createElement("span", {
    className: "fdc-art-ph"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fdc-art-ph-ico"
  }, "\u26F0"), /*#__PURE__*/React.createElement("span", {
    className: "fdc-art-ph-txt"
  }, "sem arte"))), type ? /*#__PURE__*/React.createElement("div", {
    className: "fdc-type-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fdc-c-type"
  }, type), /*#__PURE__*/React.createElement(__ds_scope.RarityGem, {
    className: "fdc-c-set",
    rarity: rarity
  })) : null, /*#__PURE__*/React.createElement("div", {
    className: "fdc-text-box"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fdc-c-rules"
  }, renderRules(rules)), flavor ? /*#__PURE__*/React.createElement("div", {
    className: "fdc-c-flavor"
  }, flavor) : null), /*#__PURE__*/React.createElement("div", {
    className: "fdc-bottom-bar"
  }, /*#__PURE__*/React.createElement("span", {
    className: "fdc-c-credit"
  }, "\u269C ", artist, " \xB7 ", collector), pt ? /*#__PURE__*/React.createElement("span", {
    className: "fdc-c-pt"
  }, pt) : null)));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/card/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forge/CardBackground.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  const {
    Card
  } = window.ForjaDeCartasDesignSystem_e2faf4;

  /** A handful of sample cards drifting in the deep background. */
  const DRIFT = [{
    name: "Chama do Solstício",
    manaCost: "3R",
    type: "Feitiço",
    rules: "Cause 4 de dano.",
    pt: "",
    rarity: "comum",
    color: "R",
    x: "4%",
    y: "8%",
    r: -8,
    d: 0
  }, {
    name: "Sentinela de Bronze",
    manaCost: "4",
    type: "Artefato — Golem",
    rules: "Vigilância",
    pt: "4/5",
    rarity: "incomum",
    color: "C",
    x: "76%",
    y: "2%",
    r: 7,
    d: 2.5
  }, {
    name: "Maré Profunda",
    manaCost: "2U",
    type: "Criatura — Serpente",
    rules: "Esta criatura não pode ser bloqueada.",
    pt: "3/3",
    rarity: "comum",
    color: "U",
    x: "82%",
    y: "52%",
    r: -6,
    d: 4
  }, {
    name: "Verdejar",
    manaCost: "1G",
    type: "Encantamento",
    rules: "Criaturas que você controla recebem +1/+1.",
    pt: "",
    rarity: "rara",
    color: "G",
    x: "2%",
    y: "55%",
    r: 9,
    d: 1.4
  }, {
    name: "Voto de Cinzas",
    manaCost: "1B",
    type: "Feitiço",
    rules: "Destrua a criatura alvo.",
    pt: "",
    rarity: "incomum",
    color: "B",
    x: "40%",
    y: "60%",
    r: -4,
    d: 3.2
  }];
  function CardBackground({
    density = "full"
  }) {
    const items = density === "full" ? DRIFT : DRIFT.slice(0, 3);
    return /*#__PURE__*/React.createElement("div", {
      className: "fk-bg",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-bg-vignette"
    }), items.map((c, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "fk-bg-card",
      style: {
        left: c.x,
        top: c.y,
        "--rot": `${c.r}deg`,
        animationDelay: `${c.d}s`
      }
    }, /*#__PURE__*/React.createElement(Card, _extends({
      size: "sm"
    }, c, {
      collector: `0${i + 2}/250`,
      artist: "acervo"
    })))));
  }
  window.CardBackground = CardBackground;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forge/CardBackground.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forge/ForgeEditor.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  const {
    Card,
    Button,
    TextField,
    Select,
    Toggle,
    SegmentedControl,
    Dropzone,
    FieldLabel
  } = window.ForjaDeCartasDesignSystem_e2faf4;
  const COLORS = [{
    value: "auto",
    label: "Automático (pelo custo)"
  }, {
    value: "W",
    label: "● Branco"
  }, {
    value: "U",
    label: "● Azul"
  }, {
    value: "B",
    label: "● Preto"
  }, {
    value: "R",
    label: "● Vermelho"
  }, {
    value: "G",
    label: "● Verde"
  }, {
    value: "multi",
    label: "◆ Multicolor (ouro)"
  }, {
    value: "C",
    label: "◆ Incolor / Artefato"
  }];

  /** The forge: live card preview on the left, edit panel on the right. */
  function ForgeEditor({
    onToast
  }) {
    const [mode, setMode] = React.useState("manual");
    const [card, setCard] = React.useState({
      name: "Guardiã das Brumas",
      manaCost: "2WU",
      type: "Criatura — Humano Mago",
      rules: "Lampejo (Você pode conjurar esta mágica a qualquer momento que pudesse conjurar um feitiço.)\nQuando a Guardiã das Brumas entrar no campo de batalha, exile uma criatura alvo até que ela deixe o campo.",
      flavor: '"A névoa não esconde. Ela escolhe o que mostrar."',
      pt: "3/4",
      rarity: "incomum",
      color: "auto",
      foil: true
    });
    const set = k => eOrVal => {
      const v = eOrVal && eOrVal.target ? eOrVal.target.value : eOrVal;
      setCard(c => ({
        ...c,
        [k]: v
      }));
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "fk-editor"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-preview"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-preview-stage"
    }, /*#__PURE__*/React.createElement(Card, _extends({
      tilt: true,
      frame: true,
      frameBase: "../../assets/frames/"
    }, card, {
      artist: "voc\xEA",
      collector: "001/250"
    }))), /*#__PURE__*/React.createElement("div", {
      className: "fk-preview-actions"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "gold",
      icon: "\u2913",
      onClick: () => onToast({
        type: "ok",
        msg: "Carta exportada como PNG!"
      })
    }, "Baixar PNG"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      icon: "\u27F3",
      onClick: () => onToast({
        type: "neutral",
        msg: "Link copiado!"
      })
    }, "Compartilhar"))), /*#__PURE__*/React.createElement("div", {
      className: "fk-panel fdc-panel"
    }, /*#__PURE__*/React.createElement(SegmentedControl, {
      block: true,
      value: mode,
      onChange: setMode,
      options: [{
        value: "manual",
        label: "Preencher campos",
        icon: "✎"
      }, {
        value: "ai",
        label: "Deixar a IA criar",
        icon: "✨"
      }]
    }), mode === "ai" ? /*#__PURE__*/React.createElement("div", {
      className: "fk-ai"
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "Descreva sua carta",
      multiline: true,
      rows: 3,
      placeholder: "Ex.: um drag\xE3o anci\xE3o de fogo que custa caro e voa\u2026"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "rune",
      block: true,
      icon: "\u2728",
      onClick: () => onToast({
        type: "neutral",
        msg: "A forja está trabalhando…"
      })
    }, "Gerar carta com IA"), /*#__PURE__*/React.createElement("p", {
      className: "fdc-hint"
    }, "A IA preenche os campos \u2014 voc\xEA ajusta o que quiser depois.")) : /*#__PURE__*/React.createElement("div", {
      className: "fk-form"
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "Nome da carta",
      value: card.name,
      onChange: set("name"),
      maxLength: 40
    }), /*#__PURE__*/React.createElement("div", {
      className: "fk-field-row"
    }, /*#__PURE__*/React.createElement(TextField, {
      label: "Custo de mana",
      value: card.manaCost,
      onChange: set("manaCost"),
      hint: "Ex.: 2WU, {X}{R}{R}"
    }), /*#__PURE__*/React.createElement(TextField, {
      label: "Poder / Resist\xEAncia",
      value: card.pt,
      onChange: set("pt"),
      placeholder: "3/4"
    })), /*#__PURE__*/React.createElement(TextField, {
      label: "Linha de tipo",
      value: card.type,
      onChange: set("type")
    }), /*#__PURE__*/React.createElement("div", {
      className: "fk-field-row"
    }, /*#__PURE__*/React.createElement(Select, {
      label: "Cor da moldura",
      options: COLORS,
      value: card.color,
      onChange: set("color")
    }), /*#__PURE__*/React.createElement(Select, {
      label: "Raridade",
      value: card.rarity,
      onChange: set("rarity"),
      options: [{
        value: "comum",
        label: "● Comum"
      }, {
        value: "incomum",
        label: "◆ Incomum"
      }, {
        value: "rara",
        label: "★ Rara"
      }, {
        value: "mítica",
        label: "✦ Mítica"
      }]
    })), /*#__PURE__*/React.createElement(TextField, {
      label: "Texto de regras",
      multiline: true,
      rows: 4,
      value: card.rules,
      onChange: set("rules"),
      hint: "Use {T}, {W}, {2}\u2026 para inserir s\xEDmbolos."
    }), /*#__PURE__*/React.createElement(TextField, {
      label: "Texto de ambienta\xE7\xE3o",
      multiline: true,
      rows: 2,
      value: card.flavor,
      onChange: set("flavor")
    }), /*#__PURE__*/React.createElement(FieldLabel, null, "Arte da carta"), /*#__PURE__*/React.createElement(Dropzone, {
      small: true,
      icon: "\u21A5",
      label: "Clique ou arraste a ilustra\xE7\xE3o"
    }), /*#__PURE__*/React.createElement("div", {
      className: "fk-panel-footer"
    }, /*#__PURE__*/React.createElement(Toggle, {
      on: card.foil,
      onChange: set("foil")
    }, "Acabamento foil"), /*#__PURE__*/React.createElement(Button, {
      variant: "gold",
      icon: "\u2692",
      onClick: () => onToast({
        type: "ok",
        msg: "Carta forjada e salva!"
      })
    }, "Forjar carta")))));
  }
  window.ForgeEditor = ForgeEditor;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forge/ForgeEditor.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forge/Gallery.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
(function () {
  const {
    Card,
    Badge,
    ManaCost,
    RarityGem
  } = window.ForjaDeCartasDesignSystem_e2faf4;
  const CARDS = [{
    name: "Chama do Solstício",
    manaCost: "3R",
    type: "Feitiço",
    rules: "Cause 4 de dano divididos como quiser entre até dois alvos.",
    rarity: "comum",
    color: "R",
    author: "valeria",
    likes: 128
  }, {
    name: "Sentinela de Bronze",
    manaCost: "4",
    type: "Artefato — Golem",
    rules: "Vigilância. Sacrifique outro artefato: +2/+0 até o fim do turno.",
    pt: "4/5",
    rarity: "incomum",
    color: "C",
    author: "joão_mtg",
    likes: 86
  }, {
    name: "Maré Profunda",
    manaCost: "2U",
    type: "Criatura — Serpente",
    rules: "Esta criatura não pode ser bloqueada.",
    pt: "3/3",
    rarity: "comum",
    color: "U",
    author: "marina",
    likes: 64
  }, {
    name: "Verdejar Eterno",
    manaCost: "1G",
    type: "Encantamento",
    rules: "No início da sua manutenção, coloque um marcador +1/+1 em uma criatura alvo.",
    rarity: "rara",
    color: "G",
    author: "tiago",
    likes: 211
  }, {
    name: "Voto de Cinzas",
    manaCost: "1B",
    type: "Feitiço",
    rules: "Destrua a criatura alvo. Você perde 2 pontos de vida.",
    rarity: "incomum",
    color: "B",
    author: "helena",
    likes: 97
  }, {
    name: "Aurora Dourada",
    manaCost: "2WW",
    type: "Criatura — Anjo",
    rules: "Voar. Outras criaturas que você controla recebem +1/+1.",
    pt: "4/4",
    rarity: "mítica",
    color: "W",
    author: "valeria",
    likes: 342
  }];
  const FILTERS = ["Todas", "Brancas", "Azuis", "Pretas", "Vermelhas", "Verdes", "Míticas"];

  /** Explore screen: a grid of community cards. */
  function Gallery({
    onOpen
  }) {
    const [filter, setFilter] = React.useState("Todas");
    return /*#__PURE__*/React.createElement("div", {
      className: "fk-gallery"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-gallery-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
      className: "fk-h2"
    }, "Explorar a cole\xE7\xE3o"), /*#__PURE__*/React.createElement("p", {
      className: "fk-sub"
    }, "Cartas forjadas pela comunidade. Abra qualquer uma para remixar.")), /*#__PURE__*/React.createElement("div", {
      className: "fk-filters"
    }, FILTERS.map(f => /*#__PURE__*/React.createElement("button", {
      key: f,
      className: `fk-chip ${filter === f ? "is-active" : ""}`,
      onClick: () => setFilter(f)
    }, f)))), /*#__PURE__*/React.createElement("div", {
      className: "fk-grid"
    }, CARDS.map((c, i) => /*#__PURE__*/React.createElement("figure", {
      key: i,
      className: "fk-grid-item",
      onClick: () => onOpen(c)
    }, /*#__PURE__*/React.createElement(Card, _extends({
      size: "sm",
      tilt: true,
      frame: true,
      frameBase: "../../assets/frames/"
    }, c, {
      artist: c.author,
      collector: `0${i + 1}/250`
    })), /*#__PURE__*/React.createElement("figcaption", {
      className: "fk-grid-meta"
    }, /*#__PURE__*/React.createElement("span", {
      className: "fk-grid-author"
    }, "por ", c.author), /*#__PURE__*/React.createElement("span", {
      className: "fk-grid-likes"
    }, "\u2665 ", c.likes))))));
  }
  window.Gallery = Gallery;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forge/Gallery.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forge/Header.jsx
try { (() => {
(function () {
  const {
    Button,
    Badge
  } = window.ForjaDeCartasDesignSystem_e2faf4;

  /** Top bar: wordmark + nav + account. */
  function Header({
    route,
    onNavigate,
    onNew
  }) {
    const link = (id, label) => /*#__PURE__*/React.createElement("button", {
      className: `fk-nav-link ${route === id ? "is-active" : ""}`,
      onClick: () => onNavigate(id)
    }, label);
    return /*#__PURE__*/React.createElement("header", {
      className: "fk-header"
    }, /*#__PURE__*/React.createElement("button", {
      className: "fk-brand",
      onClick: () => onNavigate("home")
    }, /*#__PURE__*/React.createElement("span", {
      className: "fk-brand-mark"
    }, "\u2692"), /*#__PURE__*/React.createElement("span", {
      className: "fk-brand-word"
    }, "Forja de Cartas")), /*#__PURE__*/React.createElement("nav", {
      className: "fk-nav"
    }, link("home", "Início"), link("gallery", "Explorar"), link("guide", "Guia")), /*#__PURE__*/React.createElement("div", {
      className: "fk-header-right"
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "gold"
    }, "VIP"), /*#__PURE__*/React.createElement(Button, {
      variant: "gold",
      size: "sm",
      icon: "\uFF0B",
      onClick: onNew
    }, "Nova carta")));
  }
  window.Header = Header;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forge/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/forge/Landing.jsx
try { (() => {
(function () {
  const {
    Button,
    ManaCost
  } = window.ForjaDeCartasDesignSystem_e2faf4;

  /** Landing hero — drifting cards behind a single CTA. */
  function Landing({
    onStart,
    onExplore
  }) {
    return /*#__PURE__*/React.createElement("div", {
      className: "fk-hero"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-hero-inner"
    }, /*#__PURE__*/React.createElement("div", {
      className: "fk-hero-eyebrow"
    }, /*#__PURE__*/React.createElement(ManaCost, {
      cost: "WUBRG",
      size: "sm"
    }), /*#__PURE__*/React.createElement("span", null, "Forja artesanal de cartas")), /*#__PURE__*/React.createElement("h1", {
      className: "fk-hero-title"
    }, "Crie sua pr\xF3pria lenda"), /*#__PURE__*/React.createElement("p", {
      className: "fk-hero-lead"
    }, "Desenhe cartas no estilo dos grandes jogos de cartas colecion\xE1veis \u2014 molduras, s\xEDmbolos de mana, raridade e foil. Preencha os campos ou deixe a magia da IA fazer o primeiro rascunho."), /*#__PURE__*/React.createElement("div", {
      className: "fk-hero-cta"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "gold",
      size: "lg",
      icon: "\u2692",
      onClick: onStart
    }, "Come\xE7ar a criar"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "lg",
      onClick: onExplore
    }, "Explorar a cole\xE7\xE3o")), /*#__PURE__*/React.createElement("p", {
      className: "fk-hero-note"
    }, "Gr\xE1tis para come\xE7ar \xB7 sem instalar nada")));
  }
  window.Landing = Landing;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/forge/Landing.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.RarityGem = __ds_scope.RarityGem;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Dropzone = __ds_scope.Dropzone;

__ds_ns.FieldLabel = __ds_scope.FieldLabel;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.ManaCost = __ds_scope.ManaCost;

__ds_ns.ManaPip = __ds_scope.ManaPip;

})();
