import React from "react";

/**
 * Dropzone — a dashed drop target for images (card art, overlays).
 * Visual only by default; wire `onFiles` to handle dropped/selected files.
 */
export function Dropzone({
  icon = "↥",
  label = "Clique ou arraste uma imagem aqui",
  small = false,
  accept = "image/*",
  onFiles,
  className = "",
  ...rest
}) {
  const [drag, setDrag] = React.useState(false);
  const inputRef = React.useRef(null);
  const cls = ["fdc-dropzone", small && "fdc-dropzone--sm", drag && "is-drag", className]
    .filter(Boolean)
    .join(" ");

  return (
    <label
      className={cls}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (onFiles && e.dataTransfer.files) onFiles(e.dataTransfer.files);
      }}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onFiles && onFiles(e.target.files)}
      />
      <span className="fdc-dz-icon" aria-hidden="true">{icon}</span>
      <span className="fdc-dz-text">{label}</span>
    </label>
  );
}
