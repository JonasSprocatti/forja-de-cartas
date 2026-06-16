**SegmentedControl** — the brass mode switch for choosing one of 2–4 options.

```jsx
const [mode, setMode] = React.useState("manual");
<SegmentedControl block value={mode} onChange={setMode} options={[
  { value: "manual", label: "Preencher campos", icon: "✎" },
  { value: "ai", label: "Deixar a IA criar", icon: "✨" },
]} />
```

Active segment gets the gold gradient. Use `block` to stretch segments to equal width across a panel.
