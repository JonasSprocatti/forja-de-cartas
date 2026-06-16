**ManaPip / ManaCost** — the colour-identity heart of the brand. `ManaPip` is one glossy circle; `ManaCost` parses a whole cost string into a row of pips.

```jsx
<ManaCost cost="2WU" />            {/* generic 2 + white + blue */}
<ManaCost cost="{X}{R}{R}" />      {/* braced form */}
<ManaPip symbol="G" />
<ManaPip symbol="T" size="sm" />   {/* tap symbol, in-text size */}
```

Colours: W (bone white), U (blue), B (black), R (red), G (green), C/numbers (grey generic), X (grey variable). Specials need braces in source: T (tap ↷), E (energy ⚡), P (phyrexian Φ).
Use `size="sm"` when pips sit inline inside rules text; default `md` in title bars; `lg` for display specimens.
Pips always carry the glassy top-highlight and inner shadow — never flatten them.
