export default function SpoilageRing({ risk, weather = [] }) {
  const pct = Math.round(risk * 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct < 30 ? "#5aad45" : pct < 60 ? "#e8873a" : "#d94f3d";
  const label = pct < 30 ? "Low Risk" : pct < 60 ? "Moderate Risk" : "High Risk";

  // Generate dynamic tips based on weather and risk level
  const getDynamicTips = () => {
    const tips = [];
    
    // Check for rainfall in upcoming days
    const rainyDays = weather.filter((w) => Number(w.rainfall || w.rain || 0) > 10);
    if (rainyDays.length > 0) {
      const rainyDayIndices = rainyDays.map((w) => weather.indexOf(w) + 1).filter((d) => d > 0 && d <= 7);
      if (rainyDayIndices.length > 0) {
        tips.push({
          text: `⛈️ Harvest before rainfall on Day ${rainyDayIndices.slice(0, 2).join(", ")}`,
          priority: "high"
        });
      }
    }

    // Check for high humidity
    const highHumidityDays = weather.filter((w) => Number(w.humidity || w.hum || 0) > 75);
    if (highHumidityDays.length > 0) {
      tips.push({
        text: "💧 High humidity expected - ensure proper ventilation",
        priority: pct > 40 ? "high" : "medium"
      });
    }

    // Temperature-based tips
    const hotDays = weather.filter((w) => Number(w.temperature || w.temp || 0) > 30);
    if (hotDays.length > 0) {
      tips.push({
        text: "🌡️ High temperature forecast - use insulated transport",
        priority: "medium"
      });
    }

    // Risk-based tips
    if (pct > 50) {
      tips.push({
        text: "🚨 Immediate harvest recommended - high spoilage risk",
        priority: "critical"
      });
    } else if (pct > 30) {
      tips.push({
        text: "📦 Use preservation methods (wax coating, cold storage)",
        priority: "high"
      });
    }

    // Storage recommendations
    if (pct > 20) {
      tips.push({
        text: "❄️ Cool storage at 10-15°C to reduce risk",
        priority: "medium"
      });
    }

    // Transit tips
    tips.push({
      text: "🚛 Transport within 48 hrs of harvest for best quality",
      priority: "medium"
    });

    // Default fallback tips if no weather data
    if (weather.length === 0) {
      if (pct > 40) {
        tips.push({ text: "🌾 Harvest immediately to avoid losses", priority: "high" });
        tips.push({ text: "❄️ Use cold chain storage if available", priority: "medium" });
      } else {
        tips.push({ text: "📅 Harvest within 3-5 days for optimal profit", priority: "low" });
      }
      tips.push({ text: "🚛 Minimize transit time to maintain quality", priority: "medium" });
    }

    return tips.slice(0, 4); // Limit to 4 tips
  };

  const tips = getDynamicTips();

  const getTipColor = (priority) => {
    switch (priority) {
      case "critical": return "#dc2626";
      case "high": return "#ea580c";
      case "medium": return "#ca8a04";
      default: return "var(--leaf)";
    }
  };

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
        {tips.map((tip, i) => (
          <div key={i} className="risk-tip">
            <div className="tip-dot" style={{ background: getTipColor(tip.priority) }} />
            {tip.text}
          </div>
        ))}
      </div>
    </div>
  );
}
