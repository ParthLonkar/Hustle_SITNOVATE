import { useState } from "react";
import GlobalStyles      from "./components/GlobalStyles.jsx";
import Topbar            from "./components/Topbar.jsx";
import Landing           from "./components/Landing.jsx";
import Login             from "./components/Login.jsx";
import Register          from "./components/Register.jsx";
import FarmerDashboard   from "./components/FarmerDashboard.jsx";
import AdminDashboard    from "./components/AdminDashboard.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";

/* ── Sidebar ────────────────────────────────────────────── */
const css = `
  .sidebar {
    width:220px; min-height:calc(100vh - 64px);
    background:rgba(45,26,0,.6); border-right:1px solid var(--border);
    padding:1.5rem 1rem; position:sticky; top:64px; height:calc(100vh - 64px);
    overflow-y:auto; backdrop-filter:blur(10px);
    animation:slideRight .5s ease;
  }
  .sidebar-section { margin-bottom:1.5rem; }
  .sidebar-label {
    font-size:.65rem; letter-spacing:.15em; text-transform:uppercase;
    color:rgba(253,246,227,.3); margin-bottom:.5rem; padding-left:.5rem;
  }
  .sidebar-item {
    display:flex; align-items:center; gap:.65rem;
    padding:.55rem .75rem; border-radius:10px; cursor:pointer;
    transition:all .2s; margin-bottom:.2rem;
    color:rgba(253,246,227,.65); font-size:.88rem;
    border:1px solid transparent;
  }
  .sidebar-item:hover { background:var(--mist); color:var(--cream); border-color:var(--border); }
  .sidebar-item.active {
    background:linear-gradient(135deg,rgba(45,90,39,.6),rgba(76,175,80,.15));
    color:var(--leaf-bright); border-color:rgba(76,175,80,.3);
  }
  .sidebar-icon { font-size:1rem; width:20px; text-align:center; }

  .footer {
    text-align:center; padding:2rem; font-size:.78rem;
    color:rgba(253,246,227,.18); border-top:1px solid var(--border); margin-top:2rem;
  }
`;

const FARMER_NAV = [
  { icon:"🏠", label:"Home" },
  { icon:"📊", label:"Dashboard", view:"dashboard" },
  { icon:"📋", label:"My Crops" },
  { icon:"📍", label:"My Markets" },
];
const INSIGHT_NAV = [
  { icon:"📈", label:"Mandi Prices" },
  { icon:"🔄", label:"Market Compare" },
  { icon:"⚠️", label:"Spoilage Risk" },
  { icon:"🧪", label:"Preservation" },
  { icon:"🤖", label:"AI Explainer" },
];

function AppInner() {
  const { user, login, register, logout } = useAuth();
  const [page,      setPage]      = useState("landing"); // landing | login | register | app
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sideView,  setSideView]  = useState("dashboard");

  /* ── Not authenticated ── */
  if (page === "landing") return <Landing onEnter={() => setPage("login")} />;
  if (page === "login")   return (
    <Login
      onLogin={(data) => { login(data); setPage("app"); }}
      onSwitch={() => setPage("register")}
    />
  );
  if (page === "register") return (
    <Register
      onRegister={(data) => { register(data); setPage("app"); }}
      onSwitch={() => setPage("login")}
    />
  );

  /* ── Authenticated app shell ── */
  const isAdmin = user?.role === "Admin";

  return (
    <>
      <style>{css}</style>
      <Topbar activeNav={activeNav} onNavChange={setActiveNav} />

      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-label">{user?.role ?? "Farmer"}</div>
            {FARMER_NAV.map((item, i) => (
              <div
                key={i}
                className={`sidebar-item ${sideView === (item.view ?? "") ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => item.view && setSideView(item.view)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Insights</div>
            {INSIGHT_NAV.map((item, i) => (
              <div key={i} className="sidebar-item" style={{ animationDelay: `${(i+4)*0.07}s` }}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-label">Admin</div>
              <div
                className={`sidebar-item ${sideView === "admin" ? "active" : ""}`}
                onClick={() => setSideView("admin")}
              >
                <span className="sidebar-icon">⚙️</span> Admin Panel
              </div>
            </div>
          )}

          <div className="sidebar-section">
            <div className="sidebar-item" onClick={logout}>
              <span className="sidebar-icon">🚪</span> Sign Out
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {sideView === "admin"
            ? <AdminDashboard />
            : <FarmerDashboard farmerName={user?.name ?? "Farmer"} />
          }
          <div className="footer">SITNOVATE · HUSTLE · Built with 💚 for Indian Farmers · © 2025</div>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <AppInner />
    </AuthProvider>
  );
}
