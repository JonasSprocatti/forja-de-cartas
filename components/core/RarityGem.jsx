import React from "react";

const GLYPH = {
  comum: "●", common: "●",
  incomum: "◆", uncommon: "◆",
  rara: "★", rare: "★",
  mítica: "✦", mitica: "✦", mythic: "✦",
};

const LABEL = {
  comum: "Comum", common: "Common",
  incomum: "Incomum", uncommon: "Uncommon",
  rara: "Rara", rare: "Rare",
  mítica: "Mítica", mitica: "Mítica", mythic: "Mythic",
};

/**
 * RarityGem — the set/expansion symbol whose colour encodes rarity.
 * ● common (ink) · ◆ uncommon (silver) · ★ rare (gold) · ✦ mythic (ember).
 */
export function RarityGem({ rarity = "incomum", className = "", ...rest }) {
  const key = String(rarity).toLowerCase();
  const glyph = GLYPH[key] || GLYPH.incomum;
  const cls = `fdc-rarity fdc-rarity--${key} ${className}`.trim();
  return (
    <span className={cls} role="img" aria-label={LABEL[key] || rarity} {...rest}>
      {glyph}
    </span>
  );
}
