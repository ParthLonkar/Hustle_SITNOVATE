export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { height: 100%; }

      :root {
        /* ── Green palette ── */
        --green:        #5aad45;
        --green-light:  #a8e063;
        --green-dim:    #3d7a2e;
        --green-bg:     #eaf5e2;
        --green-pill:   #cce8b0;

        /* ── Alias used in FarmerHome inline styles ── */
        --g:            #5aad45;

        /* ── Page backgrounds ── */
        --bg:           #f0f5eb;
        --bg2:          #e6efe0;
        --sidebar:      #1e2720;
        --topbar-bg:    #ffffff;

        /* ── Card surfaces ── */
        --card:         #ffffff;
        --card2:        #f6faf3;

        /* ── Borders ── */
        --border:       #dce8d4;
        --border2:      #c4ddb0;

        /* ── Text ── */
        --txt:          #1a2415;
        --txt2:         #4d6245;
        --txt3:         #8da080;
        --txt-inv:      #f0f5eb;
        --txt-inv2:     rgba(235,245,228,0.55);

        /* ── Semantic ── */
        --red:          #d94f3d;
        --red-bg:       #fff0ee;
        --amber:        #b5720e;
        --amber-bg:     #fef6e6;
        --blue:         #2a7db5;
        --blue-bg:      #eaf4fb;

        /* ── Typography — Professional Inter ── */
        --font-head: 'Inter', sans-serif;
        --font-body: 'Inter', sans-serif;

        /* ── Elevation ── */
        --shadow-sm:  0 1px 4px rgba(26,36,21,0.06);
        --shadow:     0 2px 16px rgba(26,36,21,0.09);
        --shadow-lg:  0 8px 40px rgba(26,36,21,0.14);
      }

      body { font-family: var(--font-body); background: var(--bg); color: var(--txt); overflow-x: hidden; }

      ::-webkit-scrollbar { width: 5px; height: 5px; }
      ::-webkit-scrollbar-track { background: var(--bg2); }
      ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--green); }

      /* ── Animations ── */
      @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes spin    { to{transform:rotate(360deg)} }
      @keyframes dots    { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
      @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      @keyframes ticker  { from{transform:translateX(0)} to{transform:translateX(-50%)} }


      /* ══════════════════════════════════════════
         TOPBAR  — white, crisp, minimal
      ══════════════════════════════════════════ */
      .topbar {
        position: fixed; top: 0; left: 0; right: 0; z-index: 300;
        height: 62px; display: flex; align-items: center; justify-content: space-between;
        padding: 0 28px;
        background: var(--topbar-bg);
        border-bottom: 1px solid var(--border);
        box-shadow: var(--shadow-sm);
      }
      .topbar-logo {
        display: flex; align-items: center; gap: 10px;
        font-family: var(--font-head); font-weight: 700; font-size: 17px;
        color: var(--txt); cursor: pointer; text-decoration: none;
        letter-spacing: -0.3px;
      }
      .topbar-logo-wrap { display: flex; position: relative; }
      .topbar-logo-ring { display: none; }
      .topbar-logo-icon {
        width: 34px; height: 34px; border-radius: 8px;
        background: var(--green);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-head); font-weight: 700; font-size: 12px; color: #fff;
        box-shadow: 0 2px 8px rgba(90,173,69,0.35);
        letter-spacing: 0;
      }
      .topbar-logo-text { color: var(--txt); }
      .topbar-logo-text span { color: var(--green); }

      .topbar-right { display: flex; align-items: center; gap: 12px; }
      .user-chip {
        display: flex; align-items: center; gap: 8px;
        background: var(--card2); border: 1px solid var(--border);
        border-radius: 100px; padding: 4px 14px 4px 4px;
        font-size: 13px; font-weight: 500; color: var(--txt2);
        box-shadow: var(--shadow-sm);
      }
      .user-avatar {
        width: 28px; height: 28px; border-radius: 50%;
        background: var(--green);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 600; color: #fff;
      }
      .btn-logout {
        background: transparent; border: 1px solid var(--border2);
        color: var(--txt2); padding: 7px 16px; border-radius: 8px;
        font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all .2s;
      }
      .btn-logout:hover { border-color: var(--red); color: var(--red); background: var(--red-bg); }


      /* ══════════════════════════════════════════
         SIDEBAR
      ══════════════════════════════════════════ */
      .admin-sidebar,
      .farmer-sidebar {
        position: fixed; left: 0; top: 62px; bottom: 0;
        width: 226px;
        background: var(--sidebar);
        display: flex; flex-direction: column;
        overflow-y: auto; z-index: 200;
        padding-top: 8px;
      }

      .sidebar-section-label {
        padding: 16px 20px 8px;
        font-size: 10px; font-weight: 600; color: var(--txt-inv2);
        text-transform: uppercase; letter-spacing: 1.2px;
      }

      .sidebar-item {
        display: flex; align-items: center; gap: 11px;
        padding: 11px 20px;
        border: none; cursor: pointer; width: 100%; text-align: left;
        font-family: var(--font-body); font-size: 14px; font-weight: 400;
        color: var(--txt-inv2);
        background: transparent;
        transition: all .15s;
      }
      .sidebar-item:hover {
        color: #fff;
        background: rgba(255,255,255,0.07);
      }
      .sidebar-item.active {
        background: var(--green-light);
        color: #1a2415;
        font-weight: 600;
        border-radius: 10px;
        margin: 2px 12px;
        padding: 10px 14px;
        width: calc(100% - 24px);
      }

      .sidebar-icon { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; }

      .sidebar-logout {
        margin-top: auto; padding: 16px 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
      }
      .sidebar-logout-btn {
        display: flex; align-items: center; gap: 10px;
        width: 100%; padding: 10px 14px; border-radius: 9px;
        background: transparent; border: 1px solid rgba(255,255,255,0.12);
        color: var(--txt-inv2);
        font-family: var(--font-body); font-size: 13px; cursor: pointer; transition: all .2s;
      }
      .sidebar-logout-btn:hover {
        background: rgba(217,79,61,0.15); color: #ff7b6b;
        border-color: rgba(217,79,61,.3);
      }


      /* ══════════════════════════════════════════
         LAYOUT SHELLS
      ══════════════════════════════════════════ */
      .admin-layout,
      .farmer-layout {
        display: flex;
        min-height: calc(100vh - 62px);
        padding-top: 62px;
      }
      .admin-content,
      .farmer-content {
        flex: 1; margin-left: 226px;
        padding: 28px 32px;
        background: var(--bg);
        min-height: calc(100vh - 62px);
        overflow-y: auto;
      }


      /* ══════════════════════════════════════════
         CARDS
      ══════════════════════════════════════════ */
      .g-card,
      .g-card-solid {
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 18px;
        box-shadow: var(--shadow);
        transition: box-shadow .2s, transform .2s;
      }
      .g-card:hover,
      .g-card-solid:hover { box-shadow: var(--shadow-lg); transform: translateY(-1px); }


      /* ══════════════════════════════════════════
         STAT CARDS
      ══════════════════════════════════════════ */
      .stat-card {
        background: var(--card); border: 1px solid var(--border);
        border-radius: 18px; padding: 24px;
        box-shadow: var(--shadow); transition: all .2s;
        position: relative; overflow: hidden;
      }
      .stat-card::after {
        content: ''; position: absolute; top: -24px; right: -24px;
        width: 80px; height: 80px; border-radius: 50%;
        background: var(--green-bg); pointer-events: none;
      }
      .stat-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
      .stat-icon { font-size: 22px; margin-bottom: 14px; }
      .stat-val {
        font-family: var(--font-head); font-weight: 800;
        font-size: 30px; color: var(--txt);
        line-height: 1; margin-bottom: 6px; animation: countUp .4s ease;
        letter-spacing: -1px;
      }
      .stat-lbl { font-size: 12px; color: var(--txt3); font-weight: 500; }
      .stat-sub { font-size: 11px; color: var(--green); font-weight: 600; margin-top: 8px; text-transform: uppercase; letter-spacing: .5px; }


      /* ══════════════════════════════════════════
         SECTION LABELS & HEADINGS
      ══════════════════════════════════════════ */
      .sec-label {
        display: inline-block; font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase;
        color: var(--green-dim); font-weight: 700;
        border: 1px solid var(--green-pill); background: var(--green-bg);
        border-radius: 100px; padding: 4px 12px; margin-bottom: 12px;
      }
      .sec-title {
        font-family: var(--font-head); font-weight: 700;
        font-size: clamp(20px, 3vw, 28px); color: var(--txt); margin-bottom: 6px;
        letter-spacing: -0.5px;
      }
      .sec-sub { font-size: 14px; color: var(--txt2); font-weight: 400; line-height: 1.6; }

      .page-greet { margin-bottom: 24px; }
      .page-greet h2 {
        font-family: var(--font-head); font-weight: 700; font-size: 24px;
        color: var(--txt); margin-bottom: 4px; letter-spacing: -0.5px;
      }
      .page-greet p  { font-size: 14px; color: var(--txt2); font-weight: 400; }

      .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
      .card-header-left { display: flex; align-items: center; gap: 10px; }
      .card-icon {
        width: 36px; height: 36px; border-radius: 9px;
        background: var(--green-bg); border: 1px solid var(--green-pill);
        display: flex; align-items: center; justify-content: center; font-size: 16px;
      }
      .card-title { font-family: var(--font-head); font-weight: 600; font-size: 15px; color: var(--txt); }
      .card-sub   { font-size: 12px; color: var(--txt3); margin-top: 2px; }


      /* ══════════════════════════════════════════
         TABLES
      ══════════════════════════════════════════ */
      .g-table { width: 100%; border-collapse: collapse; }
      .g-table thead th {
        font-size: 10px; font-weight: 700; color: var(--txt3);
        text-transform: uppercase; letter-spacing: .9px;
        padding: 0 16px 12px; text-align: left;
        border-bottom: 1px solid var(--border);
      }
      .g-table tbody tr { border-bottom: 1px solid var(--border); transition: background .12s; }
      .g-table tbody tr:hover { background: var(--card2); }
      .g-table tbody td { padding: 13px 16px; font-size: 13px; color: var(--txt2); }
      .g-table tbody td.bold  { color: var(--txt); font-weight: 600; }
      .g-table tbody td.green { color: var(--green-dim); font-weight: 700; }


      /* ══════════════════════════════════════════
         BUTTONS
      ══════════════════════════════════════════ */
      .btn-primary {
        background: var(--green); color: #fff;
        border: none; padding: 10px 22px; border-radius: 8px;
        font-family: var(--font-head); font-weight: 600; font-size: 14px;
        cursor: pointer; transition: all .2s; box-shadow: 0 2px 10px rgba(90,173,69,0.3);
      }
      .btn-primary:hover { background: var(--green-dim); box-shadow: 0 4px 18px rgba(90,173,69,0.4); transform: translateY(-1px); }
      .btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }

      .btn-ghost {
        background: var(--card); border: 1px solid var(--border2);
        color: var(--txt2); padding: 9px 20px; border-radius: 8px;
        font-family: var(--font-body); font-size: 13px; font-weight: 500;
        cursor: pointer; transition: all .2s; box-shadow: var(--shadow-sm);
      }
      .btn-ghost:hover { border-color: var(--green); color: var(--green-dim); background: var(--green-bg); }

      .btn-sm {
        padding: 6px 13px; border-radius: 7px; font-size: 11px; font-weight: 600;
        font-family: var(--font-body); border: none; cursor: pointer; transition: all .2s;
      }
      .btn-sm.green { background: var(--green-bg); color: var(--green-dim); border: 1px solid var(--green-pill); }
      .btn-sm.red   { background: var(--red-bg);   color: var(--red);       border: 1px solid #f5bdb7; }
      .btn-sm.ghost { background: var(--card2);     color: var(--txt2);      border: 1px solid var(--border); }
      .btn-sm:hover { transform: translateY(-1px); box-shadow: var(--shadow-sm); }


      /* ══════════════════════════════════════════
         FORM FIELDS
      ══════════════════════════════════════════ */
      .field { margin-bottom: 0; }
      .field label {
        display: block; font-size: 11px; font-weight: 600;
        color: var(--txt3); margin-bottom: 6px;
        text-transform: uppercase; letter-spacing: .7px;
      }
      .field input,
      .field select,
      .field textarea {
        width: 100%; padding: 10px 13px;
        background: var(--card2); border: 1.5px solid var(--border);
        border-radius: 8px; color: var(--txt);
        font-family: var(--font-body); font-size: 14px;
        outline: none; transition: all .2s;
      }
      .field input:focus,
      .field select:focus,
      .field textarea:focus {
        border-color: var(--green); background: #fff;
        box-shadow: 0 0 0 3px rgba(90,173,69,0.12);
      }
      .field input::placeholder { color: var(--txt3); }
      .field select { appearance: none; cursor: pointer; }


      /* ══════════════════════════════════════════
         PILLS
      ══════════════════════════════════════════ */
      .pill {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600;
      }
      .pill.green { background: var(--green-bg);  color: var(--green-dim); border: 1px solid var(--green-pill); }
      .pill.red   { background: var(--red-bg);    color: var(--red);       border: 1px solid #f5bdb7; }
      .pill.amber { background: var(--amber-bg);  color: var(--amber);     border: 1px solid #f5d9a0; }
      .pill.blue  { background: var(--blue-bg);   color: var(--blue);      border: 1px solid #b3d8ee; }
      .pill.ghost { background: var(--card2);     color: var(--txt2);      border: 1px solid var(--border); }


      /* ══════════════════════════════════════════
         PROGRESS BAR
      ══════════════════════════════════════════ */
      .prog-wrap { height: 6px; background: var(--bg2); border-radius: 3px; overflow: hidden; }
      .prog-bar  { height: 100%; border-radius: 3px; transition: width .5s ease; }


      /* ══════════════════════════════════════════
         TOAST
      ══════════════════════════════════════════ */
      .toast {
        position: fixed; top: 78px; right: 24px; z-index: 999;
        padding: 13px 20px; border-radius: 12px; font-size: 13px; font-weight: 500;
        border: 1px solid; min-width: 260px;
        display: flex; align-items: center; gap: 10px;
        animation: fadeIn .3s ease; box-shadow: var(--shadow-lg); background: var(--card);
      }
      .toast.success { border-color: var(--green-pill); color: var(--green-dim); }
      .toast.error   { border-color: #f5bdb7; color: var(--red); }


      /* ══════════════════════════════════════════
         LOADING / EMPTY
      ══════════════════════════════════════════ */
      .loading-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 12px; }
      .loading-dots span {
        width: 8px; height: 8px; border-radius: 50%; background: var(--green);
        animation: dots 1.4s ease-in-out infinite;
      }
      .loading-dots span:nth-child(2) { animation-delay: .2s; }
      .loading-dots span:nth-child(3) { animation-delay: .4s; }

      .empty-state { text-align: center; padding: 52px 20px; color: var(--txt3); }
      .empty-icon  { font-size: 42px; margin-bottom: 12px; opacity: .35; }
      .empty-state p { font-size: 14px; }


      /* ══════════════════════════════════════════
         AVATAR
      ══════════════════════════════════════════ */
      .avatar {
        border-radius: 50%; background: var(--green);
        display: flex; align-items: center; justify-content: center;
        font-weight: 600; color: #fff; flex-shrink: 0;
      }


      /* ══════════════════════════════════════════
         NAV TABS
      ══════════════════════════════════════════ */
      .nav-tabs {
        display: flex; gap: 4px; padding: 4px;
        background: var(--card); border: 1px solid var(--border);
        border-radius: 10px; width: fit-content; box-shadow: var(--shadow-sm);
      }
      .nav-tab {
        padding: 7px 18px; border-radius: 7px; border: none;
        font-family: var(--font-body); font-size: 13px; font-weight: 500;
        color: var(--txt2); background: transparent; cursor: pointer; transition: all .2s;
      }
      .nav-tab.active {
        background: var(--green); color: #fff; font-weight: 600;
        box-shadow: 0 2px 8px rgba(90,173,69,0.3);
      }
      .nav-tab:hover:not(.active) { background: var(--card2); color: var(--txt); }


      /* ══════════════════════════════════════════
         FARMER HOME
      ══════════════════════════════════════════ */
      .farmer-home { max-width: 1280px; margin: 0 auto; }

      .input-card {
        background: var(--card); border: 1px solid var(--border);
        border-radius: 18px; padding: 24px; margin-bottom: 20px; box-shadow: var(--shadow);
      }
      .input-card h3 {
        font-family: var(--font-head); font-weight: 700; font-size: 15px;
        color: var(--txt); margin-bottom: 18px;
      }
      .input-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; align-items: end; }

      .btn-analyze {
        background: var(--green); color: #fff;
        border: none; padding: 11px; border-radius: 8px;
        font-family: var(--font-head); font-weight: 600; font-size: 14px;
        cursor: pointer; transition: all .2s; box-shadow: 0 2px 10px rgba(90,173,69,.3);
      }
      .btn-analyze:hover { background: var(--green-dim); transform: translateY(-1px); }
      .btn-analyze:disabled { opacity: .5; cursor: not-allowed; transform: none; }

      .results-grid { display: grid; grid-template-columns: 3fr 1fr; gap: 20px; margin-bottom: 20px; }

      .rec-card {
        background: var(--card); border: 1px solid var(--border);
        border-radius: 18px; padding: 24px; box-shadow: var(--shadow);
      }
      .rec-card h3 { font-family: var(--font-head); font-weight: 700; font-size: 15px; color: var(--txt); margin-bottom: 18px; }
      .rec-headline { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; }
      .rec-mandi-icon {
        width: 48px; height: 48px; border-radius: 12px;
        background: var(--green); color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-head); font-weight: 700; font-size: 16px;
        flex-shrink: 0; box-shadow: 0 3px 12px rgba(90,173,69,.3);
      }
      .rec-mandi-name { font-family: var(--font-head); font-weight: 700; font-size: 18px; color: var(--txt); letter-spacing: -0.3px; }
      .rec-mandi-sub  { font-size: 13px; color: var(--txt2); margin-top: 2px; }

      .rec-metrics { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
      .metric {
        background: var(--card2); border: 1px solid var(--border);
        border-radius: 12px; padding: 16px; text-align: center;
      }
      .metric-val { font-family: var(--font-head); font-weight: 700; font-size: 18px; color: var(--green-dim); margin-bottom: 4px; letter-spacing: -0.3px; }
      .metric-lbl { font-size: 10px; color: var(--txt3); font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }

      .ai-explain {
        background: var(--green-bg); border: 1px solid var(--green-pill);
        border-radius: 12px; padding: 16px; margin-top: 16px;
      }
      .ai-explain-tag { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--green-dim); font-weight: 700; margin-bottom: 8px; }
      .ai-explain p   { font-size: 13px; color: var(--txt2); line-height: 1.65; }
      .loading-card   { text-align: center; padding: 48px; color: var(--txt2); }

      .mandi-table-card {
        background: var(--card); border: 1px solid var(--border);
        border-radius: 18px; padding: 24px; margin-bottom: 20px;
        overflow-x: auto; box-shadow: var(--shadow);
      }
      .mandi-table-card h3 { font-family: var(--font-head); font-weight: 700; font-size: 15px; color: var(--txt); margin-bottom: 18px; }
      .mandi-table-card table { width: 100%; border-collapse: collapse; }
      .mandi-table-card th {
        font-size: 10px; color: var(--txt3); text-transform: uppercase;
        letter-spacing: .9px; font-weight: 700; padding: 0 14px 12px;
        text-align: left; border-bottom: 1px solid var(--border);
      }
      .mandi-table-card td { padding: 12px 14px; font-size: 13px; color: var(--txt2); border-bottom: 1px solid var(--border); }
      .mandi-table-card tr:hover td { background: var(--card2); }
      .profit-val { color: var(--green-dim) !important; font-weight: 700 !important; }


      /* ══════════════════════════════════════════
         AUTH PAGES
      ══════════════════════════════════════════ */
      .auth-wrap { min-height: 100vh; display: flex; }
      .auth-left {
        width: 44%; background: var(--sidebar);
        display: flex; flex-direction: column; justify-content: center;
        padding: 72px 56px; position: relative; overflow: hidden;
      }
      .auth-left::before {
        content: ''; position: absolute; top: -80px; right: -80px;
        width: 320px; height: 320px; border-radius: 50%;
        background: radial-gradient(circle, rgba(90,173,69,0.15), transparent);
        pointer-events: none;
      }
      .auth-left-logo {
        font-family: var(--font-head); font-weight: 700; font-size: 20px;
        color: var(--green-light); margin-bottom: 48px;
        display: flex; align-items: center; gap: 12px;
        letter-spacing: -0.3px;
      }
      .auth-left h2 {
        font-family: var(--font-head); font-weight: 700; font-size: 34px;
        color: #fff; line-height: 1.2; margin-bottom: 16px; letter-spacing: -0.5px;
      }
      .auth-left p  { font-size: 15px; color: var(--txt-inv2); line-height: 1.7; font-weight: 400; max-width: 320px; }
      .auth-feat { display: flex; align-items: center; gap: 10px; margin-top: 13px; }
      .auth-feat-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green-light); flex-shrink: 0; }
      .auth-feat span { font-size: 14px; color: rgba(255,255,255,.6); }

      .auth-right {
        flex: 1; display: flex; align-items: center; justify-content: center;
        padding: 48px; background: var(--bg);
      }
      .auth-card {
        width: 100%; max-width: 400px;
        background: var(--card); border: 1px solid var(--border);
        border-radius: 16px; padding: 40px; box-shadow: var(--shadow-lg);
        animation: fadeUp .5s ease;
      }
      .auth-card h3 { font-family: var(--font-head); font-weight: 700; font-size: 22px; color: var(--txt); margin-bottom: 6px; letter-spacing: -0.3px; }
      .auth-card > p { font-size: 14px; color: var(--txt2); margin-bottom: 28px; font-weight: 400; }
      .auth-fields   { display: flex; flex-direction: column; gap: 16px; margin-bottom: 20px; }

      .btn-submit {
        width: 100%; background: var(--green); color: #fff;
        border: none; padding: 13px; border-radius: 9px;
        font-family: var(--font-head); font-weight: 600; font-size: 15px;
        cursor: pointer; transition: all .2s; box-shadow: 0 3px 14px rgba(90,173,69,0.35);
        margin-top: 8px;
      }
      .btn-submit:hover { background: var(--green-dim); box-shadow: 0 5px 22px rgba(90,173,69,0.45); transform: translateY(-1px); }
      .btn-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }
      .auth-switch { font-size: 13px; color: var(--txt2); margin-top: 20px; text-align: center; }
      .auth-switch span { color: var(--green-dim); cursor: pointer; font-weight: 600; }
      .auth-switch span:hover { text-decoration: underline; }
      .auth-error { color: var(--red); font-size: 13px; margin-bottom: 12px; background: var(--red-bg); border: 1px solid #f5bdb7; border-radius: 8px; padding: 10px 14px; }


      /* ══════════════════════════════════════════
         RISK CHIPS
      ══════════════════════════════════════════ */
      .risk-chip { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
      .risk-high  { background: var(--red-bg);   color: var(--red);       border: 1px solid #f5bdb7; }
      .risk-med   { background: var(--amber-bg); color: var(--amber);     border: 1px solid #f5d9a0; }
      .risk-low   { background: var(--green-bg); color: var(--green-dim); border: 1px solid var(--green-pill); }


      /* ══════════════════════════════════════════
         MISC
      ══════════════════════════════════════════ */
      .divider { height: 1px; background: var(--border); margin: 16px 0; }

      .terminal {
        font-family: 'Courier New', monospace; font-size: 12px;
        background: var(--sidebar); border-radius: 12px; padding: 20px;
        color: var(--green-light); line-height: 2;
        border: 1px solid rgba(255,255,255,0.08);
      }

      .upload-zone {
        border: 2px dashed var(--border2); border-radius: 14px;
        padding: 36px; text-align: center;
        background: var(--card2); transition: all .2s; cursor: pointer;
      }
      .upload-zone:hover { border-color: var(--green); background: var(--green-bg); }

      .ai-suggestion-box {
        background: var(--green-bg); border: 1px solid var(--green-pill);
        border-radius: 14px; padding: 18px; margin-bottom: 20px;
        box-shadow: var(--shadow-sm);
      }


      /* ══════════════════════════════════════════
         RESPONSIVE
      ══════════════════════════════════════════ */
      @media (max-width: 960px) {
        .auth-left { display: none; }
        .auth-right { padding: 28px; }
        .admin-sidebar, .farmer-sidebar { display: none; }
        .admin-content, .farmer-content { margin-left: 0; padding: 20px; }
        .input-grid { grid-template-columns: 1fr 1fr; }
        .results-grid { grid-template-columns: 1fr; }
        .rec-metrics { grid-template-columns: repeat(3,1fr); }
      }
    `}</style>
  );
}