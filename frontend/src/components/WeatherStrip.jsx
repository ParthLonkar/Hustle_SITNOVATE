export default function WeatherStrip({ weather, loading }) {
  const getIcon = (rain, hum) => {
    if (rain > 50) return "🌧️ Heavy rain";
    if (rain > 20) return "🌧️ Rain";
    if (hum > 75) return "☁️ Cloudy";
    return "☀️ Sunny";
  };

  // Handle case when weather is not available or empty
  if (!weather || weather.length === 0) {
    return (
      <div className="weather-strip">
        <h3>7-Day Weather Forecast</h3>
        <div className="empty-state" style={{ padding: 20, textAlign: "center" }}>
          {loading ? "Loading weather data..." : "No weather data available. Enter a region to see forecast."}
        </div>
      </div>
    );
  }

  return (
    <div className="weather-strip">
      <h3>7-Day Weather Forecast</h3>
      {loading && (
        <div style={{ fontSize: 12, color: "var(--textMid)", marginBottom: 8 }}>
          Updating forecast...
        </div>
      )}
      <div className="weather-days">
        {weather.map((d, i) => (
          <div key={i} className={`wday ${(d.humidity || d.hum) > 78 ? "warn" : ""}`}>
            <div className="wday-name">{d.day || "Day " + (i + 1)}</div>
            <div className="wday-icon">{getIcon(d.rain || d.rainfall || 0, d.humidity || d.hum || 0)}</div>
            <div className="wday-temp">{d.temp || d.temperature || 0}°C</div>
            <div className="wday-rain">Rain {d.rain || d.rainfall || 0}mm</div>
            <div className="wday-hum">{d.humidity || d.hum || 0}% hum</div>
          </div>
        ))}
      </div>
    </div>
  );
}
