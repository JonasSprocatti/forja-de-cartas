import * as React from "react";

export interface SegOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Options as strings or {value,label,icon}. */
  options: (string | SegOption)[];
  /** Currently selected value. */
  value?: string;
  /** Called with the chosen value. */
  onChange?: (value: string) => void;
  /** Stretch buttons to equal width. */
  block?: boolean;
}

/**
 * The brass mode switch — pick one of a small set of options.
 * @startingPoint section="Forms" subtitle="Brass segmented mode switch" viewport="700x120"
 */
export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
