import * as React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional eyebrow label (wraps the select in a field). */
  label?: string;
  /** Optional italic hint. */
  hint?: string;
  /** Options as strings or {value,label}. Omit to pass <option> children. */
  options?: (string | SelectOption)[];
  children?: React.ReactNode;
}

/** Styled dropdown with the brass chevron. */
export function Select(props: SelectProps): JSX.Element;
