import * as React from "react";

export interface ManaCostProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cost string in compact ("2WU") or braced ("{2}{W}{U}") notation. */
  cost?: string;
  /** Pre-parsed symbol array (overrides `cost`). */
  symbols?: (string | number)[];
  /** Pip size for the whole row. */
  size?: "sm" | "md" | "lg";
}

/** Parse a mana-cost string into an array of symbol tokens. */
export function parseManaCost(cost: string): string[];

/**
 * A row of mana pips parsed from a cost string — the forge's signature inline element.
 * @startingPoint section="Mana" subtitle="Coloured mana cost from a string" viewport="700x140"
 */
export function ManaCost(props: ManaCostProps): JSX.Element;
