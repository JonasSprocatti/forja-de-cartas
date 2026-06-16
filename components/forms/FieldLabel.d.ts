import * as React from "react";

export interface FieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children?: React.ReactNode;
}

/** Engraved uppercase eyebrow label for a form control. */
export function FieldLabel(props: FieldLabelProps): JSX.Element;
