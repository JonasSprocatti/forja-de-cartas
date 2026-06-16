import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Card name (title bar). */
  name?: string;
  /** Mana cost string ("2WU" or "{2}{W}{U}"); also drives the auto colour. */
  manaCost?: string;
  /** Type line, e.g. "Criatura — Humano Mago". */
  type?: string;
  /** Illustration image URL. Omitted → "sem arte" placeholder. */
  art?: string;
  /** Rules text. Supports {X} inline pips and (parenthetical) reminder italics; \n for line breaks. */
  rules?: string;
  /** Italic flavour text below the rules. */
  flavor?: string;
  /** Power/toughness (or defense) plate, e.g. "3/4". Empty hides it. */
  pt?: string;
  /** Rarity — colours the expansion gem. */
  rarity?: "comum" | "incomum" | "rara" | "mítica";
  /** Frame colour identity. "auto" derives it from the mana cost. */
  color?: "auto" | "W" | "U" | "B" | "R" | "G" | "multi" | "C";
  /** Apply the animated holographic foil finish. */
  foil?: boolean;
  /** Use a real textured frame PNG instead of the CSS frame. `true`/"auto" picks by colour, or pass a colour key. */
  frame?: boolean | "auto" | "W" | "U" | "B" | "R" | "G" | "multi" | "C";
  /** Base path to the frames folder (where the frame PNGs live), relative to the host page. Default "assets/frames/". */
  frameBase?: string;
  /** Artist credit. */
  artist?: string;
  /** Collector number, e.g. "001/250". */
  collector?: string;
  /** Display size: full (md), gallery (sm), thumbnail (xs). */
  size?: "md" | "sm" | "xs";
  /** Enable the 3D hover tilt. */
  tilt?: boolean;
}

/**
 * The original fantasy-card frame — the centrepiece of Forja de Cartas.
 * @startingPoint section="Card" subtitle="Full custom card frame (standard layout)" viewport="520x720"
 */
export function Card(props: CardProps): JSX.Element;
