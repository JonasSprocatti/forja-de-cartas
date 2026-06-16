# Forja de Cartas — Design System

> "Crie sua própria lenda." A scriptorium for forging custom trading-card-game cards.

**Forja de Cartas** ("Card Forge") is a browser tool for creating personalized Magic-style
collectible cards — choose a frame colour, set the mana cost, write the rules, pick a rarity,
add foil, and export a high-resolution card. It is built to be **easy to use, accessible,
responsive and resizable**, with a clean editor and a drifting-cards backdrop that keeps the
"forge" feeling present at all times.

This design system packages the brand's visual language — the *scriptorium / arcane workshop*
aesthetic — as reusable tokens, React components and full product screens.

## Sources

This system was reconstructed from the official open-source project (read it for deeper detail):

- **GitHub — `JonasSprocatti/forja-de-cartas`**: https://github.com/JonasSprocatti/forja-de-cartas
  The card-creator web app. The frame layouts, mana-pip system, colour identities, rarity gems,
  "scriptorium" CSS theme and the manual/AI editor flow all come from here. Explore it to build
  more faithful screens — especially `style.css`, `index.html`, and `assets/frames/`.
- **Beleren Bold** (`Beleren2016-Bold.ttf`) — the heavy display face used on card titles,
  supplied by the user and self-hosted in `assets/fonts/`. Beleren is owned by Wizards of the
  Coast; ship it only where you have the rights.

The repo is in **Brazilian Portuguese**, and so is this system's product copy.

---

## CONTENT FUNDAMENTALS

**Language.** All product copy is **Brazilian Portuguese**. UI labels, hints, toasts and card
text are written in PT-BR.

**Voice — second person, warm and craft-flavoured.** The product speaks *to* the user as
*você* and frames card-making as forging or conjuring. It is encouraging, never corporate.
Examples: *"Crie sua própria lenda."* · *"Deixar a IA criar."* · *"Forjar carta"* ·
*"Preencha os campos ou deixe a magia acontecer."*

**Casing.** Headlines and body are **sentence case**, never Title Case. Field labels and button
labels are set in **Cinzel UPPERCASE with wide tracking** as a *visual* treatment — the source
text itself is written sentence case (e.g. label text "Nome da carta", rendered uppercase by CSS).

**Tone words.** *forjar* (forge), *criar*, *conjurar*, *moldura* (frame), *acervo/coleção*
(collection), *lenda*. Game vocabulary is correct and specific: *custo de mana, raridade,
criatura, feitiço, encantamento, voar, lampejo, vigilância*.

**Card text** follows real TCG conventions: keyword first, reminder text in *(italic
parentheses)*, flavour text in italics with quotation marks, e.g.
*"A névoa não esconde. Ela escolhe o que mostrar."*

**Emoji:** none. The brand uses **engraved glyphs and unicode marks** instead (⚒ ✦ ⚜ ★ ◆ ●),
never emoji. Keep it that way.

**Microcopy is short and verb-first.** Buttons are a single glyph + 1–3 words: *⚒ Começar a
criar*, *＋ Nova carta*, *⤓ Baixar PNG*. Hints are one italic sentence.

---

## VISUAL FOUNDATIONS

**The mood: a candle-lit scriptorium.** Deep ink-brown backgrounds, parchment text, brass/gold
hardware, ember accents. Everything looks pressed, engraved or gilded rather than flat-digital.

**Colour.** Background is near-black warm ink (`--ink #14110d`); panels a touch lighter
(`--ink-2`). Text is parchment (`--parch #efe4cc`). The single accent is **brass/gold**
(`--brass #c9a14a` → `--brass-hi #f0d488`), used for headings, labels, primary buttons and
hairline borders (brass at ~28% = `--line`). **Ember** (`--b6502a`) is heat / destructive /
warning. The five mana colours (WUBRG) plus generic/colourless form a second, card-only palette,
and each drives a four-variable frame theme (`--frame`, `--frame-2`, `--titlebg`, `--txtbg`)
switched by `data-color` on a card.

**Type.** Four serif voices, no sans:
- **Cinzel** — engraved display: headings, field labels, buttons (UPPERCASE, tracking .06–.12em).
- **EB Garamond** — UI body, inputs, hints (regular + italic).
- **Spectral** — the "printed" card voice: rules and flavour text.
- **Bitter** (800) — numerals: power/toughness, loyalty, defense.
- **Beleren Bold** — heavy card-title face (self-hosted; rights-restricted).

**Backgrounds.** The signature is a **drifting-cards backdrop**: a handful of small sample cards
scattered, rotated, low-opacity (~0.28), slowly bobbing, behind a radial vignette that darkens to
ink at the edges. Surfaces themselves carry subtle **fractal-noise texture** (frame metal,
parchment grain) via inline SVG `feTurbulence`, blended soft-light. No flat gradients-for-the-sake-
of-it; no blur-glass except the sticky header (10px backdrop-blur over translucent ink).

**Depth & shadows.** Three shadow languages:
- `--shadow` — soft ambient drop for panels, cards, modals (`0 18px 50px rgba(0,0,0,.55)`).
- `--shadow-gold` — gold buttons rest on a **3D base edge** (`0 4px 0 brass-deep` + glow); press
  translates the button down onto the edge.
- `--bevel` — an emboss for the card's title/type/P-T bars (inset top highlight + bottom shadow +
  hairline) that makes them read as stamped metal/bone plates.

**Borders & radii.** Hairlines are brass-at-28%. Radii climb by role: inputs 9px, buttons 10px,
panels/modals 14px (`--r`), card bars 7px, the **card object itself 26px**, pills 999px.
Mana pips are perfect circles with a glassy top-highlight and inner shadow — never flatten them.

**Motion.** Quick, eased (`cubic-bezier(.4,0,.2,1)`), 0.15–0.18s for hovers/presses. The two
signature longer motions: a **3D card tilt** on hover (rotateY/rotateX, 0.4s) and the **foil
sweep** — a 7s looping holographic gradient over a card when `foil` is on. Drifting background
cards bob on a 16s loop. All looping/decorative motion respects `prefers-reduced-motion`.

**States.** Hover = lift 1px + stronger shadow/glow (gold), or brass-ize the border + brighten
text (ghost). Press = translate down 2px onto the 3D edge. Focus = brass border + 3px brass glow
ring at 15% — always visible (accessibility).

**Cards (UI cards).** Panels use `.fdc-panel`: ink-2 fill with a faint parchment top-sheen, brass
hairline, 14px radius, soft ambient shadow + a 1px inner top highlight. The *trading* card is its
own object — see the `Card` component.

---

## ICONOGRAPHY

The brand uses **no icon font and no emoji**. Iconography is **engraved unicode glyphs** set in
the serif faces, which keeps everything on-theme and dependency-free:

- **Brand mark:** ⚒ (hammer & pick — the forge) in a gilded square.
- **Mana & game symbols** are first-class and **drawn as CSS pips**, not icons: W U B R G (colour
  letters), generic numbers, X, plus ↷ (tap), ⚡ (energy), Φ (phyrexian). See `ManaPip`/`ManaCost`.
  Custom symbols can be added as transparent PNG/SVG and registered in a `mana.json` (see the
  upstream `_README-mana.md`); SVG is preferred so it scales for high-res export.
- **Rarity gems:** ● comum · ◆ incomum · ★ rara · ✦ mítica — colour encodes rarity.
- **Affordance glyphs:** ＋ new, ⤓ download, ⟳ share, ↥ upload/drop, ✦ foil/sparkle, ⚜ artist
  credit, ✎ manual, ✨ AI, ♥ likes.

When you need a richer pictographic icon the brand doesn't define, prefer a **single Lucide glyph**
at ~1.75px stroke in brass over inventing artwork — and flag the substitution. **Never** hand-draw
illustrative SVG art or generate images for card art; use the "sem arte" placeholder or a real
uploaded illustration.

Assets in `assets/`: `favicon.png` (app icon), `fonts/Beleren2016-Bold.ttf`, and
`frames/` — the **real textured frame PNGs** (`W/U/B/R/G/C-Basic.png` + `Golden-Basic.png`,
960×1344 with a transparent art window) used by `Card`'s image-frame mode, plus
`classic-bronze.png` (a reference texture). All from the upstream repo.

---

## INDEX — what's in this system

**Foundations**
- `styles.css` — the single entry point; link this. It `@import`s everything below.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `fonts.css` · `card-themes.css`
- `styles/components.css` · `styles/card.css` — class styles the React components emit.
- `guidelines/*.card.html` — foundation specimen cards (Colors, Type, Spacing, Brand).

**Components** (`window.ForjaDeCartasDesignSystem_e2faf4`)
- `components/card/` — **Card** (the fantasy-card frame; the centrepiece)
- `components/mana/` — **ManaPip**, **ManaCost** (+ `parseManaCost`)
- `components/core/` — **Button**, **Badge**, **RarityGem**
- `components/forms/` — **TextField**, **Select**, **Toggle**, **SegmentedControl**, **Dropzone**, **FieldLabel**
- `components/feedback/` — **Toast**

**UI kit**
- `ui_kits/forge/` — the full product: landing hero, card **editor** (live preview + form, manual
  & AI modes), community **gallery**, and a short guide. `index.html` is interactive.

**Meta**
- `SKILL.md` — makes this folder usable as a downloadable Agent Skill.

Each component has a sibling `.d.ts` (props), `.prompt.md` (when/how + example) and the directory
has one `@dsCard` demo HTML.
