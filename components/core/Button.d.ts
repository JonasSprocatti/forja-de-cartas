import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `gold` = primary forge action, `ghost` = secondary, `rune` = AI / arcane action. */
  variant?: "gold" | "ghost" | "rune";
  /** Control size. */
  size?: "sm" | "md" | "lg";
  /** Stretch to fill the container width. */
  block?: boolean;
  /** Disable interaction and dim the control. */
  disabled?: boolean;
  /** Render as an anchor pointing here instead of a <button>. */
  href?: string;
  /** Leading icon (glyph or element) shown before the label. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Primary action button for Forja de Cartas.
 * @startingPoint section="Core" subtitle="Gold / ghost / rune action buttons" viewport="700x180"
 */
export function Button(props: ButtonProps): JSX.Element;
