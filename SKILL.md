---
name: forja-de-cartas-design
description: Use this skill to generate well-branded interfaces and assets for Forja de Cartas (a Magic-style custom trading-card creator), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping — including the signature card frame and mana-pip system.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy assets
and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or
design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Orientation

- **`readme.md`** — the full design guide: content fundamentals (PT-BR voice), visual foundations,
  iconography, and an index of every file.
- **`styles.css`** — the only stylesheet to link; it `@import`s all tokens and component styles.
- **`tokens/`** — colors, typography, spacing, fonts, and the per-colour card frame themes.
- **`components/`** — React primitives. The compiled bundle is `_ds_bundle.js`; read components
  via `const { Card, ManaCost, Button, … } = window.ForjaDeCartasDesignSystem_e2faf4`.
- **`ui_kits/forge/`** — the full product (landing, editor, gallery) to copy from for screens.
- **`guidelines/`** — foundation specimen cards.

## The two things that make this brand

1. **The card.** `<Card name manaCost type rules flavor pt rarity color foil />` renders the
   fantasy-card frame. Colour is auto-derived from the mana cost. This is the hero object — most
   designs revolve around it.
2. **Mana pips.** `<ManaCost cost="2WU" />` and `<ManaPip symbol="G" />` are the signature inline
   element. Pips are glossy circles, never flat.

Brand in one line: a candle-lit **scriptorium** — ink-brown + parchment + brass/gold + ember,
all-serif type (Cinzel / EB Garamond / Spectral / Bitter), engraved glyphs (no emoji), and a
drifting-cards backdrop. Copy is **Brazilian Portuguese**, warm and craft-flavoured (*você*,
*forjar*, *crie sua própria lenda*).
