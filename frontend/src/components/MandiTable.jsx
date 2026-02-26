export default function MandiTable({ mandis }) {
  if (!mandis || mandis.length === 0) {
    return (
      <div className="mandi-table-card">
        <h3>Mandi Price Comparison</h3>
        <div className="empty-state">No live mandi data available.</div>
      </div>
    );
  }

  const isLive = mandis[0]?.mandi_name || mandis[0]?.price_date || mandis[0]?.arrival_volume;

  if (isLive) {
    return (
      <div className="mandi-table-card">
        <h3>Live Mandi Prices</h3>
        <table>
          <thead>
            <tr>
              <th>Market</th>
              <th>Price</th>
              <th>Arrival</th>
              <th>Date</th>
              <th>State</th>
              <th>District</th>
            </tr>
          </thead>
          <tbody>
            {mandis.map((m, i) => (
              <tr key={i} className={i === 0 ? "best-row" : ""}>
                <td style={{ fontWeight: 600 }}>{m.mandi_name || m.market || "-"}</td>
                <td>Rs {Number(m.price || 0).toLocaleString()}/q</td>
                <td>{m.arrival_volume || "-"}</td>
                <td>{m.price_date || "-"}</td>
                <td>{m.state || "-"}</td>
                <td>{m.district || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="mandi-table-card">
      <h3>Mandi Price Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Market</th>
            <th>Predicted Price</th>
            <th>Distance</th>
            <th>Transport Cost</th>
            <th>Net Profit</th>
            <th>7-Day Trend</th>
          </tr>
        </thead>
        <tbody>
          {mandis
            .sort((a, b) => (b.profit || 0) - (a.profit || 0))
            .map((m, i) => (
              <tr key={i} className={i === 0 ? "best-row" : ""}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>Rs {Number(m.price || 0).toLocaleString()}/q</td>
                <td>{m.distance || "-"} km</td>
                <td>Rs {Number(m.transport || 0).toLocaleString()}</td>
                <td className="profit-val">Rs {Number(m.profit || 0).toLocaleString()}</td>
                <td className={String(m.trend || "").startsWith("+") ? "trend-pos" : "trend-neg"}>{m.trend || "-"}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
