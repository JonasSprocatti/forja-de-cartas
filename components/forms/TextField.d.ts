import * as React from "react";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement> {
  /** Uppercase eyebrow label. */
  label?: string;
  /** Italic helper line below the control. */
  hint?: string;
  /** Render a <textarea> instead of an <input>. */
  multiline?: boolean;
  /** Rows when multiline. */
  rows?: number;
}

/**
 * A labelled text input or textarea with optional hint.
 * @startingPoint section="Forms" subtitle="Labelled text input / textarea" viewport="700x180"
 */
export function TextField(props: TextFieldProps): JSX.Element;
