import * as React from "react";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accent: neutral (brass), ok (green confirm), err (ember error). */
  type?: "neutral" | "ok" | "err";
  /** Leading glyph (defaults by type). */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

/** A brass-bordered status / feedback message. */
export function Toast(props: ToastProps): JSX.Element;
