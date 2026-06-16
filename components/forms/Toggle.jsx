import React from "react";

/**
 * Toggle — an on/off button. When on, it lights up with the holographic
 * "foil" gradient. Used for the Foil finish and similar binary settings.
 */
export function Toggle({ on = false, onChange, children, icon = "✦", className = "", ...rest }) {
  const cls = ["fdc-toggle", on && "is-on", className].filter(Boolean).join(" ");
  return (
    <button
      type="button"
      className={cls}
      aria-pressed={on}
      onClick={(e) => { onChange && onChange(!on); rest.onClick && rest.onClick(e); }}
      {...rest}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
}
