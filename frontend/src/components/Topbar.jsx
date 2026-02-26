import { useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import logo from "../assets/AgriRakshak.png";

export default function Topbar({ onNav, tab }) {
  const { user, logout } = useAuth();
  const { t } = useContext(LanguageContext);

  return (
    <div className="topbar">
      <div className="topbar-logo" onClick={() => onNav && onNav("home")}>
        <div className="topbar-logo-wrap">
          <div className="topbar-logo-ring" />
          <img src={logo} alt="AgriRakshak" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'contain' }} />
        </div>
        <span className="topbar-logo-text">AGRi<span>Rakshak</span></span>
      </div>

      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "?"}</div>
          <span style={{ color: "var(--txt)", fontWeight: 600 }}>{user?.name}</span>
          <span style={{ color: "var(--txt3)", fontSize: 12 }}>·</span>
          <span style={{ color: "var(--g)", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={logout}>{t('signOut')}</button>
      </div>
    </div>
  );
}
