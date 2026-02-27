import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./components/GlobalStyles";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Topbar from "./components/Topbar";
import FarmerHome from "./components/FarmerHome";
import AdminDashboard from "./components/AdminDashboard";
import TraderDashboard from "./components/TraderDashboard";

function App() {
  const [page, setPage] = useState("landing");
  const [tab, setTab] = useState("home");
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && page !== "app") {
      setPage("app");
    }
  }, [user, page]);

  useEffect(() => {
    if (!user && page === "app" && !loading) {
      setPage("landing");
    }
  }, [user, page, loading]);

  if (page === "landing") return <Landing onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  if (page === "login") return <Login onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("register")} />;
  if (page === "register") return <Register onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("login")} />;

  return (
    <div className="app-shell">
      <Topbar onNav={setTab} tab={tab} />
      {tab === "home" && user?.role === "admin" && <AdminDashboard />}
      {tab === "home" && user?.role === "trader" && <TraderDashboard />}
      {tab === "home" && user?.role === "farmer" && <FarmerHome />}
      {tab === "trader" && <TraderDashboard />}
      {tab === "farmer" && <FarmerHome />}
    </div>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <GlobalStyles />
      <App />
    </AuthProvider>
  );
}
