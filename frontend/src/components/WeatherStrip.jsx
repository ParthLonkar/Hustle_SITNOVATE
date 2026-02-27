export default function WeatherStrip({ weather, loading, compact = false, region = "" }) {
  const getCondition = (rain, hum, temp) => {
    if (rain > 50) return { icon: "🌧️", label: "Heavy Rain", warn: true, bg: "rgba(59,130,246,0.06)", border: "#bfdbfe", accent: "#2563eb" };
    if (rain > 20) return { icon: "🌦️", label: "Rain",       warn: true, bg: "rgba(99,102,241,0.06)", border: "#c7d2fe", accent: "#4f46e5" };
    if (hum > 80)  return { icon: "🌫️", label: "Humid",      warn: false, bg: "rgba(148,163,184,0.07)", border: "#e2e8f0", accent: "#64748b" };
    if (hum > 70)  return { icon: "☁️",  label: "Cloudy",     warn: false, bg: "rgba(148,163,184,0.07)", border: "#e2e8f0", accent: "#64748b" };
    if (temp > 38) return { icon: "🥵",  label: "Very Hot",   warn: true, bg: "rgba(239,68,68,0.05)", border: "#fecaca", accent: "#dc2626" };
    if (temp > 33) return { icon: "☀️",  label: "Hot",        warn: false, bg: "rgba(251,191,36,0.07)", border: "#fde68a", accent: "#d97706" };
    return           { icon: "🌤️",  label: "Sunny",      warn: false, bg: "rgba(90,173,69,0.05)", border: "var(--green-pill)", accent: "var(--green-dim)" };
  };

  const getHarvestAlert = (days) => {
    const rainy = days.filter(d => (d.rain ?? 0) > 15);
    const veryHot = days.filter(d => (d.temp ?? 0) > 37);
    const highHum = days.filter(d => (d.humidity ?? 0) > 80);
    if (rainy.length >= 3) return { type: "warning", msg: `⛈️ Heavy rainfall expected on ${rainy.length} days — harvest early this week` };
    if (veryHot.length >= 4) return { type: "danger",  msg: `🌡️ Extreme heat forecast — use cold storage and harvest at dawn` };
    if (highHum.length >= 4) return { type: "warning", msg: `💧 Sustained high humidity — risk of fungal damage, ensure ventilation` };
    return { type: "good", msg: "✅ Favorable conditions — good week for harvesting and transport" };
  };

  // ── Compact strip mode (used inline on dashboard/recommend tab) ──────────────
  if (compact) {
    if (!weather || weather.length === 0) {
      return (
        <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:"28px 24px", textAlign:"center", color:"var(--txt3)", fontSize:14 }}>
          {loading
            ? <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}><div className="loading-dots"><span/><span/><span/></div>Loading weather...</div>
            : "No weather data. Enter a region to see forecast."}
        </div>
      );
    }
    return (
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:14, padding:16, overflowX:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(weather.length,7)},1fr)`, gap:8, minWidth:420 }}>
          {weather.map((d,i) => {
            const rain = d.rain ?? d.rainfall ?? 0;
            const hum  = d.humidity ?? d.hum ?? 0;
            const temp = d.temp ?? d.temperature ?? 0;
            const { icon, label, bg, border, accent } = getCondition(rain, hum, temp);
            return (
              <div key={i} style={{ background:bg, border:`1px solid ${border}`, borderRadius:10, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--txt3)", textTransform:"uppercase", letterSpacing:".7px", marginBottom:6 }}>{d.day||`D${i+1}`}</div>
                <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
                <div style={{ fontSize:15, fontWeight:700, color:"var(--txt)", letterSpacing:"-0.3px" }}>{Number(temp).toFixed(1)}°</div>
                <div style={{ fontSize:10, fontWeight:600, color:accent, marginTop:3 }}>{label}</div>
                <div style={{ fontSize:10, color:"var(--txt3)", marginTop:5 }}>💧{rain}mm · {hum}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Full page mode (weather tab) ─────────────────────────────────────────────
  if (!weather || weather.length === 0) {
    return (
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:"64px 32px", textAlign:"center" }}>
        {loading
          ? <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div className="loading-dots"><span/><span/><span/></div>
              <p style={{ color:"var(--txt2)", fontSize:14 }}>Fetching weather forecast...</p>
            </div>
          : <div>
              <div style={{ fontSize:48, marginBottom:16 }}>🌍</div>
              <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:18, color:"var(--txt)", marginBottom:8 }}>No weather data</div>
              <p style={{ fontSize:14, color:"var(--txt3)" }}>Enter your region in Get Recommendation to load the forecast.</p>
            </div>}
      </div>
    );
  }

  const alert = getHarvestAlert(weather);
  const avgTemp = (weather.reduce((s,d) => s + (d.temp ?? d.temperature ?? 0), 0) / weather.length).toFixed(1);
  const totalRain = weather.reduce((s,d) => s + (d.rain ?? d.rainfall ?? 0), 0).toFixed(0);
  const avgHum = Math.round(weather.reduce((s,d) => s + (d.humidity ?? d.hum ?? 0), 0) / weather.length);
  const maxTemp = Math.max(...weather.map(d => d.temp ?? d.temperature ?? 0)).toFixed(1);

  const alertStyle = {
    good:    { bg:"rgba(90,173,69,0.07)",   border:"var(--green-pill)", color:"var(--green-dim)" },
    warning: { bg:"rgba(181,114,14,0.07)",  border:"#f5d9a0",          color:"var(--amber)" },
    danger:  { bg:"rgba(217,79,61,0.07)",   border:"#f5bdb7",          color:"var(--red)" },
  }[alert.type];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* ── Harvest Alert Banner ── */}
      <div style={{ padding:"14px 20px", borderRadius:14, background:alertStyle.bg, border:`1px solid ${alertStyle.border}`, display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontSize:14, fontWeight:600, color:alertStyle.color, flex:1 }}>{alert.msg}</div>
        {loading && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--green)", animation:"spin 1s linear infinite", flexShrink:0 }} />}
      </div>

      {/* ── Summary Stats Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { icon:"🌡️", label:"Avg Temp",   val:`${avgTemp}°C`,    sub:"7-day average" },
          { icon:"🌧️", label:"Total Rain", val:`${totalRain}mm`,  sub:"weekly total" },
          { icon:"💧", label:"Avg Humidity",val:`${avgHum}%`,     sub:"relative humidity" },
          { icon:"🔥", label:"Peak Temp",  val:`${maxTemp}°C`,    sub:"highest forecast" },
        ].map(s => (
          <div key={s.label} style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:16, padding:"18px 20px", boxShadow:"var(--shadow-sm)" }}>
            <div style={{ fontSize:20, marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:22, color:"var(--txt)", letterSpacing:"-0.5px", marginBottom:3 }}>{s.val}</div>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--txt3)", textTransform:"uppercase", letterSpacing:".5px", marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:11, color:"var(--txt3)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ── 7-Day Cards ── */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:24, boxShadow:"var(--shadow)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div>
            <div className="sec-label">7-Day Forecast</div>
            <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:16, color:"var(--txt)" }}>
              {region ? `${region} Weather` : "Weekly Outlook"}
            </div>
          </div>
          <div style={{ fontSize:12, color:"var(--txt3)" }}>Updated live · AgriRakshak Weather</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:10 }}>
          {weather.slice(0,7).map((d,i) => {
            const rain = d.rain ?? d.rainfall ?? 0;
            const hum  = d.humidity ?? d.hum ?? 0;
            const temp = d.temp ?? d.temperature ?? 0;
            const { icon, label, bg, border, accent, warn } = getCondition(rain, hum, temp);
            const isToday = i === 0;
            return (
              <div key={i} style={{
                background: isToday ? "var(--green)" : bg,
                border: `1.5px solid ${isToday ? "var(--green)" : border}`,
                borderRadius:14, padding:"18px 10px", textAlign:"center",
                boxShadow: isToday ? "0 4px 20px rgba(90,173,69,0.3)" : "var(--shadow-sm)",
                transform: isToday ? "translateY(-4px)" : "none",
                transition:"all .2s",
              }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:".8px", textTransform:"uppercase", marginBottom:10, color: isToday ? "rgba(255,255,255,0.8)" : "var(--txt3)" }}>
                  {isToday ? "Today" : (d.day || `Day ${i+1}`)}
                </div>
                <div style={{ fontSize:28, marginBottom:8, lineHeight:1 }}>{icon}</div>
                <div style={{ fontSize:11, fontWeight:600, marginBottom:12, color: isToday ? "rgba(255,255,255,0.9)" : accent }}>
                  {label}
                </div>
                <div style={{ fontFamily:"var(--font-head)", fontWeight:800, fontSize:20, letterSpacing:"-0.5px", marginBottom:12, color: isToday ? "#fff" : "var(--txt)" }}>
                  {Number(temp).toFixed(1)}°C
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                  <div style={{ fontSize:11, color: isToday ? "rgba(255,255,255,0.75)" : "var(--txt3)", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <span>💧</span> {rain}mm
                  </div>
                  <div style={{ fontSize:11, color: isToday ? "rgba(255,255,255,0.75)" : "var(--txt3)", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <span>💨</span> {hum}%
                  </div>
                </div>
                {warn && !isToday && (
                  <div style={{ marginTop:10, padding:"3px 6px", borderRadius:6, background:"rgba(181,114,14,0.12)", fontSize:9, fontWeight:700, color:"var(--amber)", letterSpacing:.5 }}>
                    ⚠ ALERT
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Temperature Bar Chart ── */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:24, boxShadow:"var(--shadow)" }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:15, color:"var(--txt)", marginBottom:20 }}>🌡️ Temperature Trend</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
          {weather.slice(0,7).map((d,i) => {
            const temp = d.temp ?? d.temperature ?? 0;
            const maxT = Math.max(...weather.map(x => x.temp ?? x.temperature ?? 0));
            const minT = Math.min(...weather.map(x => x.temp ?? x.temperature ?? 0));
            const heightPct = maxT === minT ? 60 : ((temp - minT) / (maxT - minT)) * 70 + 20;
            const isToday = i === 0;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{ fontSize:11, fontWeight:700, color: isToday ? "var(--green-dim)" : "var(--txt2)" }}>{Number(temp).toFixed(0)}°</div>
                <div style={{ width:"100%", height:`${heightPct}%`, borderRadius:"6px 6px 0 0", background: isToday ? "var(--green)" : "var(--green-bg)", border:`1px solid ${isToday ? "var(--green)" : "var(--green-pill)"}`, minHeight:12, transition:"height .5s ease" }} />
                <div style={{ fontSize:10, color:"var(--txt3)", fontWeight:600 }}>{d.day ? d.day.slice(0,3) : `D${i+1}`}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Farming Advisory ── */}
      <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:18, padding:24, boxShadow:"var(--shadow)" }}>
        <div style={{ fontFamily:"var(--font-head)", fontWeight:700, fontSize:15, color:"var(--txt)", marginBottom:16 }}>🌾 Farming Advisory</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            { icon:"🌅", title:"Best Harvest Days",
              body: weather.filter(d=>(d.rain??0)<5 && (d.humidity??0)<75).length > 0
                ? `${weather.filter(d=>(d.rain??0)<5 && (d.humidity??0)<75).map(d=>d.day).slice(0,3).join(", ")} — low humidity, no rain`
                : "Check conditions daily — rain expected most days" },
            { icon:"🚛", title:"Transport Advisory",
              body: avgTemp > 34 ? "Transport before 8 AM or after 6 PM to avoid heat damage" : "Normal transport windows — standard precautions apply" },
            { icon:"💦", title:"Irrigation Note",
              body: totalRain > 50 ? "Rainfall sufficient — skip irrigation this week" : totalRain > 20 ? "Light rain expected — supplement as needed" : "Dry week ahead — maintain regular irrigation schedule" },
            { icon:"🌿", title:"Storage Tip",
              body: avgHum > 75 ? "High humidity week — avoid open storage, use ventilated godowns" : "Moderate humidity — standard storage conditions are safe" },
          ].map(a => (
            <div key={a.title} style={{ padding:"14px 16px", borderRadius:12, background:"var(--card2)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontSize:16 }}>{a.icon}</span>
                <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:13, color:"var(--txt)" }}>{a.title}</div>
              </div>
              <div style={{ fontSize:12, color:"var(--txt2)", lineHeight:1.55 }}>{a.body}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}