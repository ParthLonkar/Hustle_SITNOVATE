import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import GlobalStyles from "./components/GlobalStyles";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Register from "./components/Register";
import Topbar from "./components/Topbar";
import FarmerHome from "./components/FarmerHome";
import AdminDashboard from "./components/AdminDashboard";

function App() {
  const [page, setPage] = useState("landing"); // landing | login | register | app
  const [tab, setTab] = useState("home");
  const { user } = useAuth();

  useEffect(() => {
    if (!user && page === "app") {
      const timer = setTimeout(() => setPage("landing"), 0);
      return () => clearTimeout(timer);
    }
  }, [user, page]);

  if (page === "landing") return <Landing onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  if (page === "login") return <Login onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("register")} />;
  if (page === "register") return <Register onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("login")} />;

  return (
    <div className="app-shell">
      <Topbar onNav={setTab} tab={tab} />
      {tab === "home" && user?.role === "admin" && <AdminDashboard />}
      {tab === "home" && user?.role !== "admin" && <FarmerHome />}
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
