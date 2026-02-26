import { mandiData, marketCompareData, statsData } from "./mockData.js";

const css = `
  .admin-header {
    margin-bottom:2rem; animation:fadeUp .5s ease;
  }
  .admin-header h2 { font-family:'Syne'; font-size:1.6rem; font-weight:800; margin-bottom:.3rem; }
  .admin-header p  { color:rgba(253,246,227,.45); font-size:.88rem; }

  .admin-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-bottom:2rem; }
  @media(max-width:800px){ .admin-grid{ grid-template-columns:1fr 1fr; } }

  .admin-stat {
    background:var(--card-bg); border:1px solid var(--border); border-radius:14px;
    padding:1.25rem; animation:fadeUp .5s ease both;
  }
  .admin-stat-val { font-family:'Syne'; font-size:1.75rem; font-weight:800; color:var(--sun); }
  .admin-stat-lbl { font-size:.75rem; color:rgba(253,246,227,.4); margin-top:.3rem; }

  /* User table */
  .admin-table { width:100%; border-collapse:collapse; }
  .admin-table th {
    text-align:left; font-size:.7rem; text-transform:uppercase; letter-spacing:.1em;
    color:rgba(253,246,227,.3); padding:.5rem .75rem; border-bottom:1px solid var(--border);
  }
  .admin-table td {
    padding:.7rem .75rem; font-size:.85rem;
    border-bottom:1px solid rgba(255,255,255,.03);
  }
  .admin-row { animation:fadeUp .4s ease both; }
  .admin-row:hover td { background:var(--mist); }

  .status-dot { display:inline-block; width:7px; height:7px; border-radius:50%; margin-right:.4rem; }
  .dot-active   { background:var(--leaf-bright); box-shadow:0 0 6px var(--leaf-bright); }
  .dot-inactive { background:rgba(253,246,227,.3); }

  .action-btn {
    padding:.3rem .75rem; border-radius:6px; border:1px solid var(--border);
    background:transparent; color:rgba(253,246,227,.6); font-size:.75rem; cursor:pointer;
    transition:all .2s;
  }
  .action-btn:hover { border-color:var(--leaf-bright); color:var(--leaf-bright); }
`;

const FAKE_USERS = [
  { id: "U001", name: "Ramesh Kumar",  role: "Farmer",  region: "Punjab",  active: true  },
  { id: "U002", name: "Sunita Devi",   role: "Farmer",  region: "UP",      active: true  },
  { id: "U003", name: "Anil Traders",  role: "Trader",  region: "Delhi",   active: true  },
  { id: "U004", name: "ColdPlus Ltd",  role: "Storage", region: "Nagpur",  active: false },
  { id: "U005", name: "Meera Bai",     role: "Farmer",  region: "MP",      active: true  },
];

export default function AdminDashboard() {
  return (
    <>
      <style>{css}</style>

      <div className="admin-header">
        <h2>⚙️ Admin Dashboard</h2>
        <p>Platform overview · All markets · User management</p>
      </div>

      {/* Top KPIs */}
      <div className="admin-grid">
        {[
          { val: "1,284", lbl: "Registered Users"     },
          { val: "38",    lbl: "Active Mandi Feeds"    },
          { val: "₹82L",  lbl: "Total Value Tracked"  },
          { val: "99.4%", lbl: "API Uptime"            },
          { val: "4.7★",  lbl: "Avg. User Rating"     },
          { val: "64",    lbl: "AI Alerts Sent Today"  },
        ].map((s, i) => (
          <div key={i} className="admin-stat" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="admin-stat-val">{s.val}</div>
            <div className="admin-stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">👥 Registered Users</span>
          <span className="card-badge badge-green">1,284 total</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Role</th><th>Region</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {FAKE_USERS.map((u, i) => (
              <tr key={u.id} className="admin-row" style={{ animationDelay: `${i * 0.07}s` }}>
                <td style={{ color: "rgba(253,246,227,.4)", fontSize: ".78rem" }}>{u.id}</td>
                <td style={{ fontWeight: 500 }}>{u.name}</td>
                <td><span className="card-badge badge-blue">{u.role}</span></td>
                <td style={{ color: "rgba(253,246,227,.6)" }}>{u.region}</td>
                <td>
                  <span className={`status-dot ${u.active ? "dot-active" : "dot-inactive"}`} />
                  {u.active ? "Active" : "Inactive"}
                </td>
                <td><button className="action-btn">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
