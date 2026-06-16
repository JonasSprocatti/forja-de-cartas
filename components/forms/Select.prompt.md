**Select** — brass-chevron dropdown.

```jsx
<Select label="Raridade" options={[
  { value: "comum", label: "● Comum" },
  { value: "incomum", label: "◆ Incomum" },
  { value: "rara", label: "★ Rara" },
  { value: "mítica", label: "✦ Mítica" },
]} defaultValue="incomum" />
```

Omit `label`/`hint` to get a bare select for inline toolbars. Options accept plain strings or `{value,label}`.
