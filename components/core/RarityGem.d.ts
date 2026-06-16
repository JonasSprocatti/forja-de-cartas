import * as React from "react";

export interface RarityGemProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Card rarity. Portuguese or English accepted. */
  rarity?: "comum" | "incomum" | "rara" | "mítica" | "common" | "uncommon" | "rare" | "mythic";
}

/** The expansion symbol whose colour encodes a card's rarity. */
export function RarityGem(props: RarityGemProps): JSX.Element;
