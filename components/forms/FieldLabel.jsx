import React from "react";

/**
 * FieldLabel — the engraved Cinzel uppercase eyebrow that labels every
 * control in the forge panel.
 */
export function FieldLabel({ children, htmlFor, className = "", ...rest }) {
  return (
    <label className={`fdc-field-label ${className}`.trim()} htmlFor={htmlFor} {...rest}>
      {children}
    </label>
  );
}
