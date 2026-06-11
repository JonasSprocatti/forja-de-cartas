# Símbolos de mana personalizados

Adicione aqui símbolos próprios (PNG ou SVG com transparência) e registre-os em `mana.json`.
Eles passam a valer no custo de mana e no texto das regras, com a mesma sintaxe dos embutidos.

> Use só símbolos originais ou que você tenha direito de usar. Os símbolos oficiais são da Wizards.

## Como adicionar

1. Salve a imagem nesta pasta, ex.: `assets/mana/energia.svg` (quadrada, fundo transparente).
2. Registre no `mana.json`. Cada item tem um `code` (como você vai digitá-lo) e um `src`:

```json
[
  { "code": "E",   "src": "assets/mana/energia.svg" },
  { "code": "TK",  "src": "assets/mana/ficha.png" }
]
```

3. No editor, use o código entre chaves no custo ou nas regras: `{E}`, `{TK}`.
   (Códigos de uma letra também funcionam soltos no custo, ex.: `2WUE`.)

### Formatos de item

- **Por imagem:** `{ "code": "E", "src": "assets/mana/energia.svg" }`
- **Por texto/cor** (sem imagem): `{ "code": "Z", "text": "Z", "color": "#7a3da0", "textColor": "#fff" }`

Você também pode **sobrescrever um símbolo embutido** (ex.: trocar o `T` de virar) usando o mesmo `code`.

## Observações

- Precisa do site **servido** (Vercel ou servidor local); por `file://` o navegador bloqueia o `mana.json`.
- SVG é o ideal (escala sem perder qualidade na exportação em alta resolução).
