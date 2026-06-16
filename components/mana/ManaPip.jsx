import React from "react";

/**
 * ManaPip — a single coloured mana symbol, rendered as the forge's
 * original glossy circular "pip". Pass a symbol: a colour letter
 * (W U B R G C), a generic number, X, or a special (T tap, E energy, P phyrexian).
 */
export function ManaPip({ symbol, size = "md", className = "", ...rest }) {
  const raw = String(symbol == null ? "" : symbol).trim().toUpperCase();

  // map the symbol to a colour class + the glyph shown inside the pip
  let kind = "C"; // generic / colourless fallback
  let label = raw;

  if (/^\d+$/.test(raw)) {
    kind = "C"; label = raw;            // generic mana number
  } else if (raw === "X" || raw === "Y" || raw === "Z") {
    kind = "X"; label = raw;
  } else if (raw === "T" || raw === "TAP") {
    kind = "T"; label = "↷";
  } else if (raw === "E") {
    kind = "E"; label = "⚡";
  } else if (raw === "P") {
    kind = "P"; label = "Φ";
  } else if (["W", "U", "B", "R", "G", "C"].includes(raw)) {
    kind = raw; label = raw;
  } else {
    kind = "C"; label = raw;
  }

  const cls = [
    "fdc-pip",
    `fdc-pip--${kind}`,
    size === "sm" && "fdc-pip--sm",
    size === "lg" && "fdc-pip--lg",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={cls} role="img" aria-label={`${raw} mana`} {...rest}>
      {label}
    </span>
  );
}
