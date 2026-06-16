(function () {
const { Card } = window.ForjaDeCartasDesignSystem_e2faf4;

/** A handful of sample cards drifting in the deep background. */
const DRIFT = [
  { name: "Chama do Solstício", manaCost: "3R", type: "Feitiço", rules: "Cause 4 de dano.", pt: "", rarity: "comum", color: "R", x: "4%", y: "8%", r: -8, d: 0 },
  { name: "Sentinela de Bronze", manaCost: "4", type: "Artefato — Golem", rules: "Vigilância", pt: "4/5", rarity: "incomum", color: "C", x: "76%", y: "2%", r: 7, d: 2.5 },
  { name: "Maré Profunda", manaCost: "2U", type: "Criatura — Serpente", rules: "Esta criatura não pode ser bloqueada.", pt: "3/3", rarity: "comum", color: "U", x: "82%", y: "52%", r: -6, d: 4 },
  { name: "Verdejar", manaCost: "1G", type: "Encantamento", rules: "Criaturas que você controla recebem +1/+1.", pt: "", rarity: "rara", color: "G", x: "2%", y: "55%", r: 9, d: 1.4 },
  { name: "Voto de Cinzas", manaCost: "1B", type: "Feitiço", rules: "Destrua a criatura alvo.", pt: "", rarity: "incomum", color: "B", x: "40%", y: "60%", r: -4, d: 3.2 },
];

function CardBackground({ density = "full" }) {
  const items = density === "full" ? DRIFT : DRIFT.slice(0, 3);
  return (
    <div className="fk-bg" aria-hidden="true">
      <div className="fk-bg-vignette" />
      {items.map((c, i) => (
        <div
          key={i}
          className="fk-bg-card"
          style={{ left: c.x, top: c.y, "--rot": `${c.r}deg`, animationDelay: `${c.d}s` }}
        >
          <Card size="sm" {...c} collector={`0${i + 2}/250`} artist="acervo" />
        </div>
      ))}
    </div>
  );
}
window.CardBackground = CardBackground;
})();
