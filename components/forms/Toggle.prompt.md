**Toggle** — a binary on/off button that ignites with the foil gradient when active.

```jsx
const [foil, setFoil] = React.useState(false);
<Toggle on={foil} onChange={setFoil}>Foil</Toggle>
```

Default glyph is ✦. Use for finishes and other true/false settings; for picking one of several options use `SegmentedControl` instead.
