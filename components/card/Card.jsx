import React from "react";
import { ManaCost } from "../mana/ManaCost.jsx";
import { ManaPip } from "../mana/ManaPip.jsx";
import { RarityGem } from "../core/RarityGem.jsx";

const COLOR_LETTERS = ["W", "U", "B", "R", "G"];

/** Real frame PNGs (transparent art window) from the upstream repo. */
const FRAME_FILE = {
  W: "W-Basic.png", U: "U-Basic.png", B: "B-Basic.png", R: "R-Basic.png",
  G: "G-Basic.png", C: "C-Basic.png", multi: "Golden-Basic.png",
};
/** Percentage-positioned zones shared by the basic frames (see frames.json). */
const ZONES = {
  art:    { left: "6.25%", top: "14.3%", width: "87.5%", height: "37.8%" },
  name:   { left: "6%",    top: "4.2%",  width: "57%",   height: "8%" },
  mana:   { left: "62%",   top: "4.2%",  width: "32%",   height: "8%" },
  type:   { left: "6.5%",  top: "53.3%", width: "81%",   height: "7%" },
  text:   { left: "6.5%",  top: "63.5%", width: "87%",   height: "27%" },
  pt:     { left: "75.5%", top: "91%",   width: "18.5%", height: "7.5%" },
  credit: { left: "6%",    top: "93.3%", width: "60%",   height: "4.5%" },
};

/** Guess the frame colour from a mana-cost string. */
function colorFromCost(cost) {
  const found = COLOR_LETTERS.filter((c) => new RegExp(c, "i").test(String(cost || "")));
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
    while ((m = token.exec(line))) {
      if (m.index > last) parts.push(line.slice(last, m.index));
      if (m[1]) {
        parts.push(<ManaPip key={`p${li}-${key++}`} symbol={m[1].slice(1, -1)} size="sm" />);
      } else if (m[2]) {
        parts.push(<span key={`r${li}-${key++}`} className="reminder">{m[2]}</span>);
      }
      last = token.lastIndex;
    }
    if (last < line.length) parts.push(line.slice(last));
    return (
      <React.Fragment key={li}>
        {parts}
        {li < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });
}

/**
 * Card — the original fantasy-card frame (standard layout).
 * The centrepiece of Forja de Cartas: title bar with mana cost, art window,
 * type line with rarity gem, parchment rules/flavor box, and bottom bar with
 * credit + power/toughness.
 */
export function Card({
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
    const fcls = [
      "fdc-card", "fdc-card--framed",
      size === "sm" && "fdc-card--sm",
      size === "xs" && "fdc-card--xs",
      tilt && "fdc-card--tilt",
      className,
    ].filter(Boolean).join(" ");
    return (
      <div className={fcls} data-color={fkey} data-foil={foil ? "true" : undefined} {...rest}>
        <div className="fdc-cf-art" style={ZONES.art}>
          {art ? (
            <img src={art} alt={name} />
          ) : (
            <span className="fdc-cf-art-ph">
              <span className="fdc-cf-art-ph-ico">⛰</span>
              <span className="fdc-cf-art-ph-txt">sem arte</span>
            </span>
          )}
        </div>
        <img className="fdc-cf-frame" src={`${frameBase}${file}`} alt="" aria-hidden="true" />
        <div className="fdc-cf-zone fdc-cf-zone--top fdc-cf-name" style={ZONES.name}>{name}</div>
        <div className="fdc-cf-zone fdc-cf-zone--top fdc-cf-mana" style={ZONES.mana}>
          {manaCost ? <ManaCost cost={manaCost} /> : null}
        </div>
        {type ? (
          <div className="fdc-cf-zone fdc-cf-type" style={ZONES.type}>
            <span>{type}</span>
            <RarityGem rarity={rarity} />
          </div>
        ) : null}
        <div className="fdc-cf-zone fdc-cf-text" style={ZONES.text}>
          <div className="fdc-cf-rules">{renderRules(rules)}</div>
          {flavor ? <div className="fdc-cf-flavor">{flavor}</div> : null}
        </div>
        {pt ? <div className="fdc-cf-zone fdc-cf-pt" style={ZONES.pt}>{pt}</div> : null}
        <div className="fdc-cf-zone fdc-cf-credit" style={ZONES.credit}>⚜ {artist} · {collector}</div>
      </div>
    );
  }

  const cls = [
    "fdc-card",
    size === "sm" && "fdc-card--sm",
    size === "xs" && "fdc-card--xs",
    tilt && "fdc-card--tilt",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} data-color={resolved} data-foil={foil ? "true" : undefined} {...rest}>
      <div className="fdc-card-frame">
        <div className="fdc-title-bar">
          <span className="fdc-c-name">{name}</span>
          {manaCost ? <ManaCost cost={manaCost} /> : null}
        </div>

        <div className="fdc-art-window">
          {art ? (
            <img src={art} alt={name} />
          ) : (
            <span className="fdc-art-ph">
              <span className="fdc-art-ph-ico">⛰</span>
              <span className="fdc-art-ph-txt">sem arte</span>
            </span>
          )}
        </div>

        {type ? (
          <div className="fdc-type-bar">
            <span className="fdc-c-type">{type}</span>
            <RarityGem className="fdc-c-set" rarity={rarity} />
          </div>
        ) : null}

        <div className="fdc-text-box">
          <div className="fdc-c-rules">{renderRules(rules)}</div>
          {flavor ? <div className="fdc-c-flavor">{flavor}</div> : null}
        </div>

        <div className="fdc-bottom-bar">
          <span className="fdc-c-credit">⚜ {artist} · {collector}</span>
          {pt ? <span className="fdc-c-pt">{pt}</span> : null}
        </div>
      </div>
    </div>
  );
}
