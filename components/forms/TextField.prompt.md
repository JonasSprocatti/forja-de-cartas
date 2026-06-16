**TextField** — labelled input/textarea, the workhorse of the editor panel.

```jsx
<TextField label="Nome da carta" defaultValue="Guardiã das Brumas" maxLength={40} />
<TextField label="Texto de regras" multiline rows={4}
  hint="Use {T}, {W}, {2}… para inserir símbolos." />
```

Label is the Cinzel uppercase eyebrow; hint is an italic Garamond line beneath. Inputs sit on the deepest ink with a brass focus ring. Pair inside `.fdc-field-row` (flex, gap 12px) to place two side by side.
