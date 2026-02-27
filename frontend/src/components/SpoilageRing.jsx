import { useEffect, useState } from "react";
import { apiPost } from "../services/api";

export default function SpoilageRing({ risk, weather = [], storage = null, cropType = "grain", token = null }) {
  const [liveRisk, setLiveRisk] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (!storage || (!storage.temp && !storage.humidity && !storage.transit)) {
      setLiveRisk(null);
      return;
    }
    const calculate = async () => {
      setSimLoading(true);
      try {
        const data = await apiPost(
          "/api/recommendations/simulate/spoilage",
          {
            crop_type: cropType,
            quantity: 100,
            initial_quality: 1.0,
            storage_temp: Number(storage.temp) || 20,
            storage_humidity: Number(storage.humidity) || 60,
            transit_hours: Number(storage.transit) || 0,
          },
          token
        );
        if (data?.final_spoilage_percent != null) {
          setLiveRisk(data.final_spoilage_percent / 100);
        }
      } catch {
        setLiveRisk(null);
      } finally {
        setSimLoading(false);
      }
    };
    const debounce = setTimeout(calculate, 600);
    return () => clearTimeout(debounce);
  }, [storage?.temp, storage?.humidity, storage?.transit, cropType]);

  const pct = Math.round((liveRisk ?? risk) * 100);
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct < 30 ? "#5aad45" : pct < 60 ? "#e8873a" : "#d94f3d";
  const label = pct < 30 ? "Low Risk" : pct < 60 ? "Moderate Risk" : "High Risk";

  const getDynamicTips = () => {
    const tips = [];
    const rainyDays = weather.filter((w) => Number(w.rainfall || w.rain || 0) > 10);
    if (rainyDays.length > 0) {
      const indices = rainyDays.map((w) => weather.indexOf(w) + 1).filter((d) => d > 0 && d <= 7);
      if (indices.length > 0)
        tips.push({ text: `⛈️ Harvest before rainfall on Day ${indices.slice(0, 2).join(", ")}`, priority: "high" });
    }
    const highHumidity = weather.filter((w) => Number(w.humidity || w.hum || 0) > 75);
    if (highHumidity.length > 0)
      tips.push({ text: "💧 High humidity expected - ensure proper ventilation", priority: pct > 40 ? "high" : "medium" });
    const hotDays = weather.filter((w) => Number(w.temperature || w.temp || 0) > 30);
    if (hotDays.length > 0)
      tips.push({ text: "🌡️ High temperature forecast - use insulated transport", priority: "medium" });
    if (pct > 50)
      tips.push({ text: "🚨 Immediate harvest recommended - high spoilage risk", priority: "critical" });
    else if (pct > 30)
      tips.push({ text: "📦 Use preservation methods (wax coating, cold storage)", priority: "high" });
    if (pct > 20)
      tips.push({ text: "❄️ Cool storage at 10-15°C to reduce risk", priority: "medium" });
    tips.push({ text: "🚛 Transport within 48 hrs of harvest for best quality", priority: "medium" });
    if (weather.length === 0) {
      if (pct > 40) {
        tips.push({ text: "🌾 Harvest immediately to avoid losses", priority: "high" });
        tips.push({ text: "❄️ Use cold chain storage if available", priority: "medium" });
      } else {
        tips.push({ text: "📅 Harvest within 3-5 days for optimal profit", priority: "low" });
      }
      tips.push({ text: "🚛 Minimize transit time to maintain quality", priority: "medium" });
    }
    return tips.slice(0, 4);
  };

  const tips = getDynamicTips();
  const getTipColor = (p) => ({ critical:"#dc2626", high:"#ea580c", medium:"#ca8a04" }[p] || "var(--green)");

  return (
    <div className="spoilage-card">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <h3 style={{ fontFamily:"var(--font-head)", fontSize:11, fontWeight:700, color:"var(--txt3)", textTransform:"uppercase", letterSpacing:"1px", margin:0 }}>
          Spoilage Risk Estimator
        </h3>
        {simLoading && (
          <div style={{ display:"flex", gap:3 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:5, height:5, borderRadius:"50%", background:"var(--green)", animation:"dots 1.4s ease-in-out infinite", animationDelay:`${i*0.2}s` }} />
            ))}
          </div>
        )}
        {liveRisk !== null && !simLoading && (
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", background:"var(--green-bg)", color:"var(--green-dim)", border:"1px solid var(--green-pill)", borderRadius:100, padding:"2px 8px" }}>
            Live
          </span>
        )}
      </div>

      <div className="risk-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="var(--bg2)" strokeWidth="10" />
          <circle
            cx="65" cy="65" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 0.8s ease, stroke 0.4s ease", transformOrigin:"center", transform:"rotate(-90deg)" }}
          />
        </svg>
        <div className="risk-ring-center">
          <div className="risk-pct" style={{ color, transition:"color 0.4s" }}>{pct}%</div>
          <div className="risk-lbl" style={{ fontSize:11, color:"var(--txt3)" }}>risk</div>
        </div>
      </div>

      <div className="risk-badge" style={{
        background: pct < 30 ? "var(--green-bg)" : pct < 60 ? "var(--amber-bg)" : "var(--red-bg)",
        borderColor: pct < 30 ? "var(--green-pill)" : pct < 60 ? "#f5d9a0" : "#f5bdb7",
        color: pct < 30 ? "var(--green-dim)" : pct < 60 ? "var(--amber)" : "var(--red)",
      }}>
        {label}
      </div>

      <div className="risk-tips">
        {tips.map((tip, i) => (
          <div key={i} className="risk-tip">
            <div className="tip-dot" style={{ background:getTipColor(tip.priority), flexShrink:0 }} />
            <span style={{ fontSize:12, color:"var(--txt2)", lineHeight:1.4 }}>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}