(function () {
const { Button, Badge } = window.ForjaDeCartasDesignSystem_e2faf4;

/** Top bar: wordmark + nav + account. */
function Header({ route, onNavigate, onNew }) {
  const link = (id, label) => (
    <button
      className={`fk-nav-link ${route === id ? "is-active" : ""}`}
      onClick={() => onNavigate(id)}
    >
      {label}
    </button>
  );
  return (
    <header className="fk-header">
      <button className="fk-brand" onClick={() => onNavigate("home")}>
        <span className="fk-brand-mark">⚒</span>
        <span className="fk-brand-word">Forja de Cartas</span>
      </button>
      <nav className="fk-nav">
        {link("home", "Início")}
        {link("gallery", "Explorar")}
        {link("guide", "Guia")}
      </nav>
      <div className="fk-header-right">
        <Badge variant="gold">VIP</Badge>
        <Button variant="gold" size="sm" icon="＋" onClick={onNew}>Nova carta</Button>
      </div>
    </header>
  );
}
window.Header = Header;
})();
