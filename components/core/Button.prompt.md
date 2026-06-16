**Button** — the forge's main action control; use `gold` for the primary action on a view, `ghost` for secondary/neutral actions, and `rune` for AI-powered ("Deixar a IA criar") actions.

```jsx
<Button variant="gold" icon="⚒">Começar a criar</Button>
<Button variant="ghost">Como funciona</Button>
<Button variant="rune" block icon="✨">Gerar carta com IA</Button>
```

Variants: `gold` (linear gold, 3D press), `ghost` (hairline outline), `rune` (purple arcane).
Sizes: `sm`, `md` (default), `lg` (hero). Props: `block`, `disabled`, `href` (renders `<a>`), `icon`.
Labels are Cinzel, sentence-case, often led by a single glyph. Keep them short and verb-first.
