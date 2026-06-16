import React from "react";
import { FieldLabel } from "./FieldLabel.jsx";

/**
 * TextField — a labelled text control (single or multi-line) with an
 * optional italic hint. The standard building block of the forge panel.
 */
export function TextField({
  label,
  hint,
  multiline = false,
  rows = 4,
  id,
  className = "",
  ...rest
}) {
  const fieldId = id || (label ? `f-${String(label).toLowerCase().replace(/\s+/g, "-")}` : undefined);
  return (
    <div className={`fdc-field ${className}`.trim()}>
      {label ? <FieldLabel htmlFor={fieldId}>{label}</FieldLabel> : null}
      {multiline ? (
        <textarea id={fieldId} className="fdc-textarea" rows={rows} {...rest} />
      ) : (
        <input id={fieldId} className="fdc-input" type={rest.type || "text"} {...rest} />
      )}
      {hint ? <p className="fdc-hint">{hint}</p> : null}
    </div>
  );
}
