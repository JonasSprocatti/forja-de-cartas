import * as React from "react";

export interface ManaPipProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** A mana symbol: colour letter (W U B R G C), generic number, X/Y/Z, or special (T tap, E energy, P phyrexian). */
  symbol: string | number;
  /** Pip size. `sm` is the in-text size; `lg` for hero display. */
  size?: "sm" | "md" | "lg";
}

/**
 * A single glossy circular mana pip.
 */
export function ManaPip(props: ManaPipProps): JSX.Element;
