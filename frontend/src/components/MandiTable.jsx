import { useState } from "react";

/* Maps Indian cities/districts → correct state name */
const CITY_TO_STATE = {
  nagpur:"Maharashtra",wardha:"Maharashtra",amravati:"Maharashtra",akola:"Maharashtra",
  yavatmal:"Maharashtra",pune:"Maharashtra",mumbai:"Maharashtra",nashik:"Maharashtra",
  aurangabad:"Maharashtra",solapur:"Maharashtra",kolhapur:"Maharashtra",sangli:"Maharashtra",
  satara:"Maharashtra",latur:"Maharashtra",nanded:"Maharashtra",chandrapur:"Maharashtra",
  buldhana:"Maharashtra",washim:"Maharashtra",hingoli:"Maharashtra",parbhani:"Maharashtra",
  jalna:"Maharashtra",beed:"Maharashtra",osmanabad:"Maharashtra",raigad:"Maharashtra",
  ratnagiri:"Maharashtra",sindhudurg:"Maharashtra",thane:"Maharashtra",
  ahmednagar:"Maharashtra",dhule:"Maharashtra",nandurbar:"Maharashtra",jalgaon:"Maharashtra",
  gondia:"Maharashtra",bhandara:"Maharashtra",gadchiroli:"Maharashtra",
  indore:"Madhya Pradesh",bhopal:"Madhya Pradesh",gwalior:"Madhya Pradesh",
  jabalpur:"Madhya Pradesh",ujjain:"Madhya Pradesh",sagar:"Madhya Pradesh",
  ratlam:"Madhya Pradesh",dewas:"Madhya Pradesh",mandsaur:"Madhya Pradesh",
  neemuch:"Madhya Pradesh",hoshangabad:"Madhya Pradesh",vidisha:"Madhya Pradesh",
  lucknow:"Uttar Pradesh",kanpur:"Uttar Pradesh",agra:"Uttar Pradesh",
  varanasi:"Uttar Pradesh",allahabad:"Uttar Pradesh",meerut:"Uttar Pradesh",
  bareilly:"Uttar Pradesh",aligarh:"Uttar Pradesh",moradabad:"Uttar Pradesh",
  ludhiana:"Punjab",amritsar:"Punjab",jalandhar:"Punjab",patiala:"Punjab",
  bathinda:"Punjab",moga:"Punjab",ferozepur:"Punjab",faridkot:"Punjab",sangrur:"Punjab",
  ambala:"Haryana",karnal:"Haryana",panipat:"Haryana",hisar:"Haryana",
  rohtak:"Haryana",sirsa:"Haryana",fatehabad:"Haryana",
  jaipur:"Rajasthan",jodhpur:"Rajasthan",kota:"Rajasthan",ajmer:"Rajasthan",
  bikaner:"Rajasthan",udaipur:"Rajasthan",alwar:"Rajasthan",bharatpur:"Rajasthan",
  ahmedabad:"Gujarat",surat:"Gujarat",vadodara:"Gujarat",rajkot:"Gujarat",
  bhavnagar:"Gujarat",anand:"Gujarat",gandhinagar:"Gujarat",junagadh:"Gujarat",
  bangalore:"Karnataka",mysore:"Karnataka",hubli:"Karnataka",dharwad:"Karnataka",
  belgaum:"Karnataka",gulbarga:"Karnataka",bijapur:"Karnataka",shimoga:"Karnataka",
  vijayawada:"Andhra Pradesh",guntur:"Andhra Pradesh",kurnool:"Andhra Pradesh",
  nellore:"Andhra Pradesh",tirupati:"Andhra Pradesh",visakhapatnam:"Andhra Pradesh",
  warangal:"Telangana",nizamabad:"Telangana",karimnagar:"Telangana",khammam:"Telangana",
  chennai:"Tamil Nadu",coimbatore:"Tamil Nadu",madurai:"Tamil Nadu",
  kolkata:"West Bengal",howrah:"West Bengal",burdwan:"West Bengal",
  patna:"Bihar",gaya:"Bihar",bhagalpur:"Bihar",muzaffarpur:"Bihar",
};

function resolveState(stateField, districtField) {
  const lower = (stateField || "").trim().toLowerCase();
  if (CITY_TO_STATE[lower]) return CITY_TO_STATE[lower];
  const distLower = (districtField || "").trim().toLowerCase();
  if (CITY_TO_STATE[distLower]) return CITY_TO_STATE[distLower];
  return (stateField || "").trim() || "-";
}

const PAGE_SIZE = 15;

export default function MandiTable({ mandis }) {
  const [page, setPage] = useState(0);
  const [sortCol, setSortCol] = useState("price");
  const [sortDir, setSortDir] = useState("desc");
  const [search, setSearch] = useState("");

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
    /* ── filter ── */
    const filtered = mandis.filter(m => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        (m.mandi_name || m.market || "").toLowerCase().includes(q) ||
        (m.district || "").toLowerCase().includes(q) ||
        resolveState(m.state, m.district).toLowerCase().includes(q)
      );
    });

    /* ── sort ── */
    const sorted = [...filtered].sort((a, b) => {
      let av, bv;
      if (sortCol === "price")    { av = Number(a.price || 0); bv = Number(b.price || 0); }
      else if (sortCol === "arrival") { av = Number(a.arrival_volume || 0); bv = Number(b.arrival_volume || 0); }
      else if (sortCol === "market")  { av = (a.mandi_name || a.market || ""); bv = (b.mandi_name || b.market || ""); return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av); }
      else if (sortCol === "district"){ av = (a.district||""); bv = (b.district||""); return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av); }
      else { av = Number(a.price || 0); bv = Number(b.price || 0); }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
    const paginated  = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const toggleSort = (col) => {
      if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
      else { setSortCol(col); setSortDir("desc"); }
      setPage(0);
    };

    const SortIcon = ({ col }) => {
      if (sortCol !== col) return <span style={{ color: "var(--border2)", marginLeft: 4 }}>↕</span>;
      return <span style={{ color: "var(--green)", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
    };

    const maxPrice = Math.max(...filtered.map(m => Number(m.price || 0)));

    return (
      <div className="mandi-table-card">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div>
            <h3 style={{ margin: 0 }}>Live Mandi Prices</h3>
            <div style={{ fontSize: 12, color: "var(--txt3)", marginTop: 3 }}>
              {filtered.length} markets found{search && ` for "${search}"`}
            </div>
          </div>
          {/* Search */}
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search market / district…"
            style={{
              padding: "8px 12px", borderRadius: 8, border: "1.5px solid var(--border)",
              background: "var(--card2)", color: "var(--txt)", fontSize: 13,
              fontFamily: "var(--font-body)", outline: "none", width: 220,
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  { key: "market",   label: "Market" },
                  { key: "price",    label: "Price (₹/q)" },
                  { key: "arrival",  label: "Arrival (q)" },
                  { key: null,       label: "Date" },
                  { key: null,       label: "State" },
                  { key: "district", label: "District" },
                ].map(({ key, label }, ci) => (
                  <th key={ci}
                    onClick={() => key && toggleSort(key)}
                    style={{
                      fontSize: 10, color: "var(--txt3)", textTransform: "uppercase",
                      letterSpacing: ".9px", fontWeight: 700,
                      padding: "0 14px 12px", textAlign: "left",
                      borderBottom: "1px solid var(--border)",
                      cursor: key ? "pointer" : "default",
                      userSelect: "none", whiteSpace: "nowrap",
                    }}
                  >
                    {label}{key && <SortIcon col={key} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((m, i) => {
                const price = Number(m.price || 0);
                const isBest = price === maxPrice;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: isBest ? "rgba(90,173,69,0.04)" : undefined }}>
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--txt)", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                      {isBest && (
                        <span style={{ fontSize: 9, background: "var(--green)", color: "#fff", borderRadius: 4, padding: "2px 5px", fontWeight: 700, letterSpacing: ".5px" }}>BEST</span>
                      )}
                      {m.mandi_name || m.market || "-"}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: isBest ? "var(--green-dim)" : "var(--txt2)", fontWeight: isBest ? 700 : 500 }}>
                      ₹{price.toLocaleString()}
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>{m.arrival_volume || "-"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--txt3)" }}>{m.price_date || "-"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>{resolveState(m.state, m.district)}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>{m.district || "-"}</td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "32px 14px", textAlign: "center", color: "var(--txt3)", fontSize: 13 }}>No results match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--txt3)" }}>
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length} markets
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--txt2)", fontSize: 12, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? .4 : 1 }}
              >← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  style={{ padding: "6px 10px", borderRadius: 7, fontSize: 12, cursor: "pointer", border: "1px solid", borderColor: i === page ? "var(--green)" : "var(--border)", background: i === page ? "var(--green)" : "var(--card2)", color: i === page ? "#fff" : "var(--txt2)", fontWeight: i === page ? 700 : 400 }}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--card2)", color: "var(--txt2)", fontSize: 12, cursor: page === totalPages - 1 ? "not-allowed" : "pointer", opacity: page === totalPages - 1 ? .4 : 1 }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Non-live / prediction view ── */
  return (
    <div className="mandi-table-card">
      <h3>Mandi Price Comparison</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Market","Predicted Price","Distance","Transport Cost","Net Profit","7-Day Trend"].map(h => (
              <th key={h} style={{ fontSize: 10, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: ".9px", fontWeight: 700, padding: "0 14px 12px", textAlign: "left", borderBottom: "1px solid var(--border)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mandis.sort((a, b) => (b.profit || 0) - (a.profit || 0)).map((m, i) => (
            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--txt)", fontSize: 13 }}>{m.name}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>₹{Number(m.price || 0).toLocaleString()}/q</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>{m.distance || "-"} km</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--txt2)" }}>₹{Number(m.transport || 0).toLocaleString()}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--green-dim)", fontWeight: 700 }}>₹{Number(m.profit || 0).toLocaleString()}</td>
              <td style={{ padding: "11px 14px", fontSize: 13, color: String(m.trend||"").startsWith("+") ? "var(--green-dim)" : "var(--red)", fontWeight: 600 }}>{m.trend || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}