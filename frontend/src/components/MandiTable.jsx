export default function MandiTable({ mandis }) {
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
            .sort((a, b) => b.profit - a.profit)
            .map((m, i) => (
              <tr key={i} className={i === 0 ? "best-row" : ""}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>Rs {m.price.toLocaleString()}/q</td>
                <td>{m.distance} km</td>
                <td>Rs {m.transport.toLocaleString()}</td>
                <td className="profit-val">Rs {m.profit.toLocaleString()}</td>
                <td className={m.trend.startsWith("+") ? "trend-pos" : "trend-neg"}>{m.trend}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
