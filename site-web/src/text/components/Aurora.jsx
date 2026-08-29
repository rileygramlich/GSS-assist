import "./Aurora.css";

/** Two slow green washes behind everything. Purely atmosphere; hidden from AT. */
export default function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <span className="aurora-a" />
      <span className="aurora-b" />
      <span className="aurora-grain" />
    </div>
  );
}
