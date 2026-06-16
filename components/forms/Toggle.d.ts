import * as React from "react";

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current on/off state. */
  on?: boolean;
  /** Called with the next boolean state when clicked. */
  onChange?: (next: boolean) => void;
  /** Leading glyph. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** On/off button that lights up with the holographic foil gradient when on. */
export function Toggle(props: ToggleProps): JSX.Element;
