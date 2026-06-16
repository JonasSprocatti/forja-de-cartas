import React from "react";

/**
 * Badge — a small status / label pill.
 * `gold` for VIP-style emphasis, `pub`/`priv` for visibility state,
 * `neutral` for a plain outlined tag.
 */
export function Badge({ variant = "neutral", children, className = "", ...rest }) {
  const cls = `fdc-badge fdc-badge--${variant} ${className}`.trim();
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
