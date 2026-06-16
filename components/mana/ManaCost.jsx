import React from "react";
import { ManaPip } from "./ManaPip.jsx";

/**
 * Parse a mana-cost string into an array of symbols.
 * Accepts compact form ("2WU", "XR") and braced form ("{2}{W}{U}", "{W/U}").
 * Braced tokens are kept whole; in compact form digits group into one
 * generic number and each letter becomes its own pip.
 */
export function parseManaCost(cost) {
  const out = [];
  const str = String(cost == null ? "" : cost).trim();
  if (!str) return out;

  if (str.includes("{")) {
    const re = /\{([^}]+)\}/g;
    let m;
    while ((m = re.exec(str))) out.push(m[1].trim());
    return out;
  }
  // compact: digits clump, letters are individual
  let num = "";
  for (const ch of str) {
    if (/\d/.test(ch)) {
      num += ch;
    } else if (/[a-zA-Z]/.test(ch)) {
      if (num) { out.push(num); num = ""; }
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
export function ManaCost({ cost, symbols, size = "md", className = "", ...rest }) {
  const list = symbols && symbols.length ? symbols : parseManaCost(cost);
  return (
    <span className={`fdc-manacost ${className}`.trim()} {...rest}>
      {list.map((s, i) => (
        <ManaPip key={i} symbol={s} size={size} />
      ))}
    </span>
  );
}
