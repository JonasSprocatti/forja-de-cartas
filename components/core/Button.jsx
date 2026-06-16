import React from "react";

/**
 * Button — the forge's primary action control.
 * Three brand variants: gold (primary), ghost (secondary), rune (AI / arcane).
 * Renders an <a> when `href` is supplied, otherwise a <button>.
 */
export function Button({
  variant = "gold",
  size = "md",
  block = false,
  disabled = false,
  href,
  icon,
  children,
  className = "",
  ...rest
}) {
  const cls = [
    "fdc-btn",
    `fdc-btn--${variant}`,
    size === "sm" && "fdc-btn--sm",
    size === "lg" && "fdc-btn--lg",
    block && "fdc-btn--block",
    disabled && "fdc-btn--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {icon ? <span className="fdc-btn-icon" aria-hidden="true">{icon}</span> : null}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <a className={cls} href={href} {...rest}>
        {content}
      </a>
    );
  }
  return (
    <button className={cls} type={rest.type || "button"} disabled={disabled} {...rest}>
      {content}
    </button>
  );
}
