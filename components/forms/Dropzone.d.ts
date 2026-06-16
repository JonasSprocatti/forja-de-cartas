import * as React from "react";

export interface DropzoneProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Glyph shown in the zone. */
  icon?: React.ReactNode;
  /** Prompt text. */
  label?: string;
  /** Compact one-line variant. */
  small?: boolean;
  /** Accept filter for the file input. */
  accept?: string;
  /** Called with a FileList when files are dropped or chosen. */
  onFiles?: (files: FileList) => void;
}

/** Dashed image drop target (card art, overlays). */
export function Dropzone(props: DropzoneProps): JSX.Element;
