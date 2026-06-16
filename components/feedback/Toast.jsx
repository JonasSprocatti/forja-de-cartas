import React from "react";

/**
 * Toast — a brass-bordered status message. `type` sets the accent:
 * neutral (brass), ok (green), err (ember).
 */
export function Toast({ type = "neutral", icon, children, className = "", ...rest }) {
  const cls = ["fdc-toast", type === "ok" && "fdc-toast--ok", type === "err" && "fdc-toast--err", className]
    .filter(Boolean)
    .join(" ");
  const fallbackIcon = type === "ok" ? "✓" : type === "err" ? "⚠" : "✦";
  return (
    <div className={cls} role="status" aria-live="polite" {...rest}>
      <span aria-hidden="true">{icon || fallbackIcon}</span>
      <span>{children}</span>
    </div>
  );
}
