import React from "react";
import { FieldLabel } from "./FieldLabel.jsx";

/**
 * Select — a styled dropdown with the brass chevron. Provide `options`
 * as [{value, label}] or simple strings, or pass <option> children.
 */
export function Select({ label, hint, options, id, children, className = "", ...rest }) {
  const fieldId = id || (label ? `s-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const opts =
    options &&
    options.map((o, i) => {
      const value = typeof o === "object" ? o.value : o;
      const text = typeof o === "object" ? o.label : o;
      return (
        <option key={i} value={value}>
          {text}
        </option>
      );
    });
  const select = (
    <select id={fieldId} className="fdc-select" {...rest}>
      {opts || children}
    </select>
  );
  if (!label && !hint) return select;
  return (
    <div className={`fdc-field ${className}`.trim()}>
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      {select}
      {hint ? <p className="fdc-hint">{hint}</p> : null}
    </div>
  );
}
