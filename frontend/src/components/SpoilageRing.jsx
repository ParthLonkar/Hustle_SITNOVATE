export default function SpoilageRing({ risk }) {
  const pct = Math.round(risk * 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct < 30 ? "#5aad45" : pct < 60 ? "#e8873a" : "#d94f3d";
  const label = pct < 30 ? "Low Risk" : pct < 60 ? "Moderate Risk" : "High Risk";

  return (
    <div className="spoilage-card">
      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--textMid)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 16 }}>
        Spoilage Risk Estimator
      </h3>
      <div className="risk-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="risk-ring-center">
          <div className="risk-pct" style={{ color }}>{pct}%</div>
          <div className="risk-lbl">risk</div>
        </div>
      </div>
      <div className="risk-badge" style={pct < 30 ? { background: "#eef7e8", borderColor: "#c8e8b8", color: "var(--leaf)" } : {}}>{label}</div>
      <div className="risk-tips">
        <div className="risk-tip"><div className="tip-dot" /> Harvest before predicted rainfall on Day 3-4</div>
        <div className="risk-tip"><div className="tip-dot" /> Use cool dry storage at 10-15C</div>
        <div className="risk-tip"><div className="tip-dot" style={{ background: "var(--orange)" }} /> Transport within 48 hrs of harvest</div>
      </div>
    </div>
  );
}
