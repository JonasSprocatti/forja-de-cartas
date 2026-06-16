**Dropzone** — dashed image drop target for card art and overlays.

```jsx
<Dropzone label="Clique ou arraste uma imagem aqui" onFiles={(files) => upload(files[0])} />
<Dropzone small icon="＋" label="Adicionar PNG por cima da carta" />
```

`small` gives the compact one-line row used for overlays / back-face art. Highlights to brass on hover and during drag.
