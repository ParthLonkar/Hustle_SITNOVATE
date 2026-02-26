export default function WeatherStrip({ weather, loading }) {
  const getCondition = (rain, hum) => {
    if (rain > 50) return { icon: "🌧️", label: "Heavy Rain", warn: true };
    if (rain > 20) return { icon: "🌦️", label: "Rain", warn: false };
    if (hum > 75) return { icon: "☁️", label: "Cloudy", warn: false };
    return { icon: "☀️", label: "Sunny", warn: false };
  };

  if (!weather || weather.length === 0) {
    return (
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "32px 24px", textAlign: "center",
        color: "var(--txt3)", fontSize: 14,
      }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div className="loading-dots"><span /><span /><span /></div>
            Loading weather data...
          </div>
        ) : "No weather data available. Enter a region to see forecast."}
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div style={{
          fontSize: 12, color: "var(--txt3)", marginBottom: 10,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--green)", animation: "spin 1s linear infinite",
          }} />
          Updating forecast...
        </div>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(weather.length, 7)}, 1fr)`,
        gap: 10,
      }}>
        {weather.map((d, i) => {
          const rain = d.rain ?? d.rainfall ?? 0;
          const hum  = d.humidity ?? d.hum ?? 0;
          const temp = d.temp ?? d.temperature ?? 0;
          const { icon, label, warn } = getCondition(rain, hum);

          return (
            <div key={i} style={{
              background: warn ? "var(--amber-bg)" : "var(--card2)",
              border: `1px solid ${warn ? "#f5d9a0" : "var(--border)"}`,
              borderRadius: 12,
              padding: "16px 10px",
              textAlign: "center",
              boxShadow: "var(--shadow-sm)",
            }}>
              {/* Day name */}
              <div style={{
                fontSize: 11, fontWeight: 700, color: "var(--txt3)",
                textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10,
              }}>
                {d.day || `Day ${i + 1}`}
              </div>

              {/* Weather icon */}
              <div style={{ fontSize: 26, marginBottom: 6, lineHeight: 1 }}>{icon}</div>

              {/* Condition label */}
              <div style={{
                fontSize: 11, fontWeight: 600, marginBottom: 10,
                color: warn ? "var(--amber)" : "var(--txt2)",
              }}>
                {label}
              </div>

              {/* Temperature */}
              <div style={{
                fontSize: 17, fontWeight: 700, color: "var(--txt)",
                letterSpacing: "-0.5px", marginBottom: 10,
              }}>
                {Number(temp).toFixed(1)}°C
              </div>

              {/* Rain & Humidity */}
              <div style={{
                display: "flex", flexDirection: "column", gap: 3,
                fontSize: 11, color: "var(--txt3)", fontWeight: 500,
              }}>
                <div>💧 {rain}mm</div>
                <div>💨 {hum}% hum</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}