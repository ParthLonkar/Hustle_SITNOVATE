import { weatherData } from "./mockData.js";

const css = `
  .weather-strip { display:flex; gap:1rem; overflow-x:auto; padding-bottom:.5rem; }
  .weather-strip::-webkit-scrollbar { display:none; }

  .weather-day {
    flex-shrink: 0;
    background: var(--mist); border: 1px solid var(--border);
    border-radius: 14px; padding: .85rem 1rem;
    text-align: center; min-width: 80px;
    transition: all .25s; cursor: pointer;
    animation: fadeUp .5s ease both;
  }
  .weather-day:hover, .weather-day.today {
    background: rgba(76,175,80,.1); border-color: rgba(76,175,80,.3);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(76,175,80,.15);
  }
  .weather-day .wd-day  { font-size:.7rem; color:rgba(253,246,227,.45); margin-bottom:.4rem; }
  .weather-day .wd-icon { font-size:1.5rem; margin-bottom:.35rem; animation: float 3s ease infinite; }
  .weather-day .wd-temp { font-family:'Syne'; font-weight:700; font-size:.95rem; }
`;

export default function WeatherStrip() {
  return (
    <>
      <style>{css}</style>
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-header">
          <span className="card-title">🌤 Weekly Forecast</span>
          <span className="card-badge badge-blue">Nagpur Region</span>
        </div>
        <div className="weather-strip">
          {weatherData.map((d, i) => (
            <div
              key={i}
              className={`weather-day ${d.today ? "today" : ""}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="wd-day">{d.day}</div>
              <div className="wd-icon">{d.icon}</div>
              <div className="wd-temp">{d.temp}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
