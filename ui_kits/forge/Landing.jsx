(function () {
const { Button, ManaCost } = window.ForjaDeCartasDesignSystem_e2faf4;

/** Landing hero — drifting cards behind a single CTA. */
function Landing({ onStart, onExplore }) {
  return (
    <div className="fk-hero">
      <div className="fk-hero-inner">
        <div className="fk-hero-eyebrow">
          <ManaCost cost="WUBRG" size="sm" />
          <span>Forja artesanal de cartas</span>
        </div>
        <h1 className="fk-hero-title">Crie sua própria lenda</h1>
        <p className="fk-hero-lead">
          Desenhe cartas no estilo dos grandes jogos de cartas colecionáveis —
          molduras, símbolos de mana, raridade e foil. Preencha os campos ou
          deixe a magia da IA fazer o primeiro rascunho.
        </p>
        <div className="fk-hero-cta">
          <Button variant="gold" size="lg" icon="⚒" onClick={onStart}>Começar a criar</Button>
          <Button variant="ghost" size="lg" onClick={onExplore}>Explorar a coleção</Button>
        </div>
        <p className="fk-hero-note">Grátis para começar · sem instalar nada</p>
      </div>
    </div>
  );
}
window.Landing = Landing;
})();
