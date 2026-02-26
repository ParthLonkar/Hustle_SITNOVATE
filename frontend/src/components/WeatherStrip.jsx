export default function WeatherStrip({ weather }) {
  const getIcon = (rain, hum) => {
    if (rain > 50) return "Heavy rain";
    if (rain > 20) return "Rain";
    if (hum > 75) return "Cloudy";
    return "Sunny";
  };

  return (
    <div className="weather-strip">
      <h3>7-Day Weather Forecast</h3>
      <div className="weather-days">
        {weather.map((d, i) => (
          <div key={i} className={`wday ${d.humidity > 78 ? "warn" : ""}`}>
            <div className="wday-name">{d.day}</div>
            <div className="wday-icon">{getIcon(d.rain, d.humidity)}</div>
            <div className="wday-temp">{d.temp}C</div>
            <div className="wday-rain">Rain {d.rain}%</div>
            <div className="wday-hum">{d.humidity}% hum</div>
          </div>
        ))}
      </div>
    </div>
  );
}
