(function () {
const { Card, Button, TextField, Select, Toggle, SegmentedControl, Dropzone, FieldLabel } =
  window.ForjaDeCartasDesignSystem_e2faf4;

const COLORS = [
  { value: "auto", label: "Automático (pelo custo)" },
  { value: "W", label: "● Branco" },
  { value: "U", label: "● Azul" },
  { value: "B", label: "● Preto" },
  { value: "R", label: "● Vermelho" },
  { value: "G", label: "● Verde" },
  { value: "multi", label: "◆ Multicolor (ouro)" },
  { value: "C", label: "◆ Incolor / Artefato" },
];

/** The forge: live card preview on the left, edit panel on the right. */
function ForgeEditor({ onToast }) {
  const [mode, setMode] = React.useState("manual");
  const [card, setCard] = React.useState({
    name: "Guardiã das Brumas",
    manaCost: "2WU",
    type: "Criatura — Humano Mago",
    rules: "Lampejo (Você pode conjurar esta mágica a qualquer momento que pudesse conjurar um feitiço.)\nQuando a Guardiã das Brumas entrar no campo de batalha, exile uma criatura alvo até que ela deixe o campo.",
    flavor: '"A névoa não esconde. Ela escolhe o que mostrar."',
    pt: "3/4",
    rarity: "incomum",
    color: "auto",
    foil: true,
  });
  const set = (k) => (eOrVal) => {
    const v = eOrVal && eOrVal.target ? eOrVal.target.value : eOrVal;
    setCard((c) => ({ ...c, [k]: v }));
  };

  return (
    <div className="fk-editor">
      {/* preview */}
      <div className="fk-preview">
        <div className="fk-preview-stage">
          <Card tilt frame frameBase="../../assets/frames/" {...card} artist="você" collector="001/250" />
        </div>
        <div className="fk-preview-actions">
          <Button variant="gold" icon="⤓" onClick={() => onToast({ type: "ok", msg: "Carta exportada como PNG!" })}>
            Baixar PNG
          </Button>
          <Button variant="ghost" icon="⟳" onClick={() => onToast({ type: "neutral", msg: "Link copiado!" })}>
            Compartilhar
          </Button>
        </div>
      </div>

      {/* panel */}
      <div className="fk-panel fdc-panel">
        <SegmentedControl block value={mode} onChange={setMode} options={[
          { value: "manual", label: "Preencher campos", icon: "✎" },
          { value: "ai", label: "Deixar a IA criar", icon: "✨" },
        ]} />

        {mode === "ai" ? (
          <div className="fk-ai">
            <TextField label="Descreva sua carta" multiline rows={3}
              placeholder="Ex.: um dragão ancião de fogo que custa caro e voa…" />
            <Button variant="rune" block icon="✨"
              onClick={() => onToast({ type: "neutral", msg: "A forja está trabalhando…" })}>
              Gerar carta com IA
            </Button>
            <p className="fdc-hint">A IA preenche os campos — você ajusta o que quiser depois.</p>
          </div>
        ) : (
          <div className="fk-form">
            <TextField label="Nome da carta" value={card.name} onChange={set("name")} maxLength={40} />
            <div className="fk-field-row">
              <TextField label="Custo de mana" value={card.manaCost} onChange={set("manaCost")}
                hint="Ex.: 2WU, {X}{R}{R}" />
              <TextField label="Poder / Resistência" value={card.pt} onChange={set("pt")}
                placeholder="3/4" />
            </div>
            <TextField label="Linha de tipo" value={card.type} onChange={set("type")} />
            <div className="fk-field-row">
              <Select label="Cor da moldura" options={COLORS} value={card.color} onChange={set("color")} />
              <Select label="Raridade" value={card.rarity} onChange={set("rarity")} options={[
                { value: "comum", label: "● Comum" },
                { value: "incomum", label: "◆ Incomum" },
                { value: "rara", label: "★ Rara" },
                { value: "mítica", label: "✦ Mítica" },
              ]} />
            </div>
            <TextField label="Texto de regras" multiline rows={4} value={card.rules} onChange={set("rules")}
              hint="Use {T}, {W}, {2}… para inserir símbolos." />
            <TextField label="Texto de ambientação" multiline rows={2} value={card.flavor} onChange={set("flavor")} />
            <FieldLabel>Arte da carta</FieldLabel>
            <Dropzone small icon="↥" label="Clique ou arraste a ilustração" />
            <div className="fk-panel-footer">
              <Toggle on={card.foil} onChange={set("foil")}>Acabamento foil</Toggle>
              <Button variant="gold" icon="⚒" onClick={() => onToast({ type: "ok", msg: "Carta forjada e salva!" })}>
                Forjar carta
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
window.ForgeEditor = ForgeEditor;
})();
