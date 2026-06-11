# Fontes da carta

O texto da carta usa três variáveis de fonte, definidas no `style.css`:

- `--card-font-title` — nome e linha de tipo
- `--card-font-body`  — regras e flavor
- `--card-font-pt`    — P/R, lealdade, defesa

## Como usar uma fonte própria

1. Coloque o arquivo aqui, ex.: `assets/fonts/minha-fonte.woff2` (use **woff2** — mais leve).
2. No `style.css`, declare a `@font-face` e troque a variável (há um bloco comentado pronto no fim do arquivo):

```css
@font-face{
  font-family:"CartaTitulo";
  src:url("assets/fonts/minha-fonte.woff2") format("woff2");
  font-display:swap;
}
:root{ --card-font-title: "CartaTitulo", "Cinzel", serif; }
```

> A fonte oficial de Magic ("Beleren") é propriedade da Wizards — não a redistribua.
> Para um visual parecido e legal, procure alternativas livres (ex.: "Goudy Mediaeval",
> "Cinzel" para títulos, "Spectral"/"EB Garamond" para o corpo).
