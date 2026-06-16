import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `gold` = filled emphasis (VIP), `pub` = public/green, `priv` = private, `neutral` = outlined. */
  variant?: "gold" | "pub" | "priv" | "neutral";
  children?: React.ReactNode;
}

/** A small status or label pill. */
export function Badge(props: BadgeProps): JSX.Element;
