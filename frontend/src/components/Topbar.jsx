import { useAuth } from "../context/AuthContext";

export default function Topbar({ onNav, tab }) {
  const { user, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="topbar-logo" onClick={() => onNav("home")}>
        <div className="topbar-logo-icon">AC</div>
        AGRiCHAIN
      </div>
      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          {user?.name} - {user?.role}
        </div>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}
