(function () {
const { Card, Badge, ManaCost, RarityGem } = window.ForjaDeCartasDesignSystem_e2faf4;

const CARDS = [
  { name: "Chama do Solstício", manaCost: "3R", type: "Feitiço", rules: "Cause 4 de dano divididos como quiser entre até dois alvos.", rarity: "comum", color: "R", author: "valeria", likes: 128 },
  { name: "Sentinela de Bronze", manaCost: "4", type: "Artefato — Golem", rules: "Vigilância. Sacrifique outro artefato: +2/+0 até o fim do turno.", pt: "4/5", rarity: "incomum", color: "C", author: "joão_mtg", likes: 86 },
  { name: "Maré Profunda", manaCost: "2U", type: "Criatura — Serpente", rules: "Esta criatura não pode ser bloqueada.", pt: "3/3", rarity: "comum", color: "U", author: "marina", likes: 64 },
  { name: "Verdejar Eterno", manaCost: "1G", type: "Encantamento", rules: "No início da sua manutenção, coloque um marcador +1/+1 em uma criatura alvo.", rarity: "rara", color: "G", author: "tiago", likes: 211 },
  { name: "Voto de Cinzas", manaCost: "1B", type: "Feitiço", rules: "Destrua a criatura alvo. Você perde 2 pontos de vida.", rarity: "incomum", color: "B", author: "helena", likes: 97 },
  { name: "Aurora Dourada", manaCost: "2WW", type: "Criatura — Anjo", rules: "Voar. Outras criaturas que você controla recebem +1/+1.", pt: "4/4", rarity: "mítica", color: "W", author: "valeria", likes: 342 },
];

const FILTERS = ["Todas", "Brancas", "Azuis", "Pretas", "Vermelhas", "Verdes", "Míticas"];

/** Explore screen: a grid of community cards. */
function Gallery({ onOpen }) {
  const [filter, setFilter] = React.useState("Todas");
  return (
    <div className="fk-gallery">
      <div className="fk-gallery-head">
        <div>
          <h2 className="fk-h2">Explorar a coleção</h2>
          <p className="fk-sub">Cartas forjadas pela comunidade. Abra qualquer uma para remixar.</p>
        </div>
        <div className="fk-filters">
          {FILTERS.map((f) => (
            <button key={f} className={`fk-chip ${filter === f ? "is-active" : ""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="fk-grid">
        {CARDS.map((c, i) => (
          <figure key={i} className="fk-grid-item" onClick={() => onOpen(c)}>
            <Card size="sm" tilt frame frameBase="../../assets/frames/" {...c} artist={c.author} collector={`0${i + 1}/250`} />
            <figcaption className="fk-grid-meta">
              <span className="fk-grid-author">por {c.author}</span>
              <span className="fk-grid-likes">♥ {c.likes}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
window.Gallery = Gallery;
})();
