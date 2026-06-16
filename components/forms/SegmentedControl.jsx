import React from "react";

/**
 * SegmentedControl — the brass "mode switch". Pick one option from a small
 * set (e.g. ✎ Preencher campos / ✨ Deixar a IA criar).
 */
export function SegmentedControl({ options = [], value, onChange, block = false, className = "", ...rest }) {
  const items = options.map((o) => (typeof o === "object" ? o : { value: o, label: o }));
  const cls = ["fdc-seg", block && "fdc-seg--block", className].filter(Boolean).join(" ");
  return (
    <div className={cls} role="tablist" {...rest}>
      {items.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          className={`fdc-seg-btn ${value === o.value ? "is-active" : ""}`.trim()}
          onClick={() => onChange && onChange(o.value)}
        >
          {o.icon ? <span aria-hidden="true">{o.icon}</span> : null}
          {o.label}
        </button>
      ))}
    </div>
  );
}
