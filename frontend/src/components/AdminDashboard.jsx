import { recentRecs } from "./mockData";

export default function AdminDashboard() {
  return (
    <div className="admin-dash">
      <div className="page-greet"><h2>Admin Dashboard</h2><p>System overview and recent recommendation activity.</p></div>
      <div className="admin-stats">
        {[
          { val: "12,482", lbl: "Total Farmers", change: "+124 this week", up: true },
          { val: "94,310", lbl: "Recommendations Served", change: "+1,240 today", up: true },
          { val: "92.4%", lbl: "Price Forecast Accuracy", change: "-0.3% vs last week", up: false },
          { val: "Rs 2.1Cr", lbl: "Farmer Profit Generated", change: "+Rs 18L this month", up: true }
        ].map((s, i) => (
          <div className="astat" key={i}>
            <div className="astat-val">{s.val}</div>
            <div className="astat-lbl">{s.lbl}</div>
            <div className={`astat-change ${s.up ? "up" : "down"}`}>{s.change}</div>
          </div>
        ))}
      </div>
      <div className="admin-table-card">
        <h3>Recent Recommendations</h3>
        <table>
          <thead><tr><th>Farmer</th><th>Crop</th><th>Region</th><th>Recommended Mandi</th><th>Est. Net Profit</th><th>Spoilage Risk</th><th>Time</th></tr></thead>
          <tbody>
            {recentRecs.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.farmer}</td>
                <td>{r.crop}</td>
                <td>{r.region}</td>
                <td>{r.mandi}</td>
                <td className="profit-val">Rs {r.profit.toLocaleString()}</td>
                <td>{r.risk}</td>
                <td style={{ color: "var(--textFaint)", fontSize: 13 }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
