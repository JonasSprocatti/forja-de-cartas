# Frames personalizados

Coloque aqui os frames que **você mesmo** fizer (PNG com transparência) e registre-os em `frames.json`.
Eles aparecem no app no seletor **"Frame"** (ao lado de "Padrão").

> Use só frames originais ou que você tenha direito de usar. Não inclua aqui os frames oficiais da Wizards.

## Como adicionar um frame

1. **Crie um PNG** na proporção da carta (recomendado **960 × 1344**, que é 480×672 em 2×).
   - A **janela de arte** deve ser **transparente** (alpha 0): a ilustração fica *atrás* do frame e aparece por esse buraco.
   - O resto do PNG é o seu desenho (bordas, barra de título, caixa de texto, etc.).
   - As quinas fora do arredondamento podem ser transparentes; o app recorta a carta com cantos arredondados.

2. **Salve o arquivo** nesta pasta, ex.: `assets/frames/meu-frame.png`.

3. **Adicione um item** no `frames.json` apontando para ele e dizendo **onde** cada elemento entra.
   As coordenadas são em **porcentagem** da carta (0–100), então funcionam em qualquer resolução.

```json
{
  "id": "meu-frame",
  "name": "Meu Frame",
  "src": "assets/frames/meu-frame.png",
  "zones": {
    "art":    { "x": 6, "y": 14, "w": 88, "h": 38 },
    "name":   { "x": 6,  "y": 4,  "w": 60, "h": 8, "align": "left",   "color": "#1c160c", "size": 26, "font": "title" },
    "mana":   { "x": 64, "y": 4,  "w": 30, "h": 8, "align": "right" },
    "type":   { "x": 6,  "y": 53, "w": 80, "h": 7, "align": "left",   "color": "#1c160c", "size": 18, "font": "title" },
    "text":   { "x": 6,  "y": 64, "w": 88, "h": 26,"align": "left",   "color": "#1a150d", "size": 19, "font": "body" },
    "pt":     { "x": 78, "y": 92, "w": 16, "h": 6, "align": "center", "color": "#1c160c", "size": 24, "font": "pt" },
    "credit": { "x": 6,  "y": 94, "w": 55, "h": 4, "align": "left",   "color": "#efe3cf", "size": 13, "font": "pt" }
  }
}
```

### Campos de cada zona

- `x`, `y`, `w`, `h` — posição/tamanho em **%** da carta.
- `align` — `left`, `center` ou `right`.
- `color` — cor do texto (use claro em barras escuras, escuro em barras claras).
- `size` — tamanho da fonte em px (na carta em tamanho real).
- `font` — `title` (Cinzel), `body` (Spectral) ou `pt` (Bitter).

Zonas que você **omitir** simplesmente não são desenhadas (ex.: um frame de feitiço sem `pt`).
O campo `name` aceita o nome da carta; `mana` desenha os pips; `text` junta regras + flavor; `credit` mostra "illus. … · número".

## Observações

- O seletor de **Frame** funciona com o conteúdo padrão (nome, custo, tipo, regras, flavor, P/R, arte).
  Layouts com listas (planeswalker, saga, classe) continuam usando os frames embutidos.
- Para os frames da pasta carregarem, o site precisa estar **servido** (no Vercel, ou um servidor local).
  Abrir o `index.html` direto por `file://` bloqueia a leitura do `frames.json` por segurança do navegador.

---

## Detecção automática (atualizado)

O app agora escolhe o frame sozinho pelo **tipo, supertipo e cor** da carta. Para que um frame novo entre na detecção automática, basta seguir a **convenção de nomes** no `id` dentro do `frames.json`:

```
{PREFIXO}-{KIND}[-Legendary][-PR]
```

**PREFIXO (cor / identidade):** `W`, `U`, `B`, `R`, `G`, `Golden` (multicolor), `C` (incolor), `V` (Veículo), `E` (Eldrazi).
Um id **sem prefixo** (ex.: `Planeswalker`) vale para **todas as cores** daquele layout.

**KIND (layout / tipo especial):**

| KIND no id           | Quando é aplicado                          |
|----------------------|--------------------------------------------|
| *(nenhum — `Basic`)* | Cartas padrão (criatura, mágica, artefato…) |
| `Planeswalker`       | Layout Planeswalker                         |
| `Saga`               | Layout Saga                                 |
| `Class`              | Layout Classe                               |
| `Battle`             | Layout Batalha                              |
| `Adventure`          | Layout Aventura                             |
| `Token`              | Layout Ficha                                |
| `Emblem`             | Layout Emblema                              |
| `Split`              | Layout Dividida                             |
| `DFC-Front` / `DFC-Back` / `DFC` | Dupla face (frente / verso / ambas) |
| `Land`               | Layout Terreno ou tipo "Terreno" na linha de tipo |
| `Equipment`, `Aura`, `Room`, `Omen` | Subtipo correspondente na linha de tipo |

**Variantes:** acrescente `-Legendary` (supertipo Lendário) e/ou `-PR` (carta com Poder/Resistência).
Exemplos: `W-Planeswalker`, `Golden-Saga`, `R-Battle-Legendary`, `U-DFC-Back`, `B-Adventure-PR`.
Se a variante exata não existir, o app cai para a mais próxima (ex.: sem `B-Planeswalker`, usa `B-Basic`).

### Regras explícitas (opcional): campo `match`

Para casos fora da convenção, adicione `match` ao item do `frames.json` — o frame com mais critérios batendo vence:

```json
{
  "id": "dragoes-showcase",
  "name": "Showcase de Dragões",
  "src": "assets/frames/dragoes-showcase.png",
  "match": { "typeIncludes": ["dragão"], "legendary": true, "colors": ["R", "multi"] },
  "zones": { "...": "..." }
}
```

Campos aceitos: `layout` (string ou lista), `colors` (`W U B R G multi C`), `legendary` (true/false), `pt` (true/false), `face` (`front`/`back`), `typeIncludes` (trechos da linha de tipo, sem diferenciar acento).

### Zona opcional `rarity`

Se a carta tiver um **ícone de raridade enviado** (PNG), ele é posicionado na ponta direita da barra de tipo. Para controlar a posição no seu frame, declare a zona:

```json
"rarity": { "x": 85, "y": 56.3, "w": 7.5, "h": 5 }
```
