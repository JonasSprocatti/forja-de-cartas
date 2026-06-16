**Card** — the original fantasy-card frame, and the single most important object in the system. Standard layout: title bar (name + mana cost), art window, type line (with rarity gem), parchment rules/flavor box, bottom bar (credit + power/toughness).

```jsx
<Card
  name="Guardiã das Brumas"
  manaCost="2WU"
  type="Criatura — Humano Mago"
  rules={"Lampejo (Você pode conjurar esta mágica a qualquer momento.)\nQuando a Guardiã das Brumas entrar no campo de batalha, exile uma criatura alvo até que ela deixe o campo."}
  flavor={'"A névoa não esconde. Ela escolhe o que mostrar."'}
  pt="3/4"
  rarity="incomum"
  foil
/>
```

`color="auto"` (default) reads the mana cost to pick the WUBRG/multi/colourless frame; override with an explicit colour. Rules text auto-renders `{T}`/`{R}`… as inline pips and `(text)` as italic reminder text. Sizes: `md` (full 480×672), `sm` (gallery), `xs` (thumbnail) — use the small sizes for grids and the drifting hero background. Add `tilt` for a 3D hover. Set `foil` for the animated holographic sweep.

**Two frame renderers.** By default the frame is drawn in CSS (lightweight, fully tweakable). Pass `frame` to use the **real textured frame PNGs** from the upstream repo instead — `frame` (or `frame="auto"`) picks the PNG by colour, or pass a colour key. Set `frameBase` to the path of the `assets/frames/` folder relative to the page (e.g. `frameBase="../../assets/frames/"`). The artwork shows through the frame's transparent window and text is laid into percentage-positioned zones, so it scales at any size.

```jsx
<Card name="Chama do Solstício" manaCost="3R" type="Feitiço — Arcano"
  rules="Cause 4 de dano a qualquer alvo." rarity="rara"
  frame frameBase="../../assets/frames/" />
```
