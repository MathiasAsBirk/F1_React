import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const Toast = ({ type = "success", message }) => {
  if (!message) return null;
  const bg = type === "success" ? "#153f2e" : "#4a1d1d";
  const border = type === "success" ? "#19c37d" : "#ef4444";
  return (
    <div style={{
      position: "fixed", top: 16, right: 16, padding: "10px 14px",
      background: bg, color: "white", border: `1px solid ${border}`,
      borderRadius: 8, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,.3)"
    }}>
      {message}
    </div>
  );
};

export default function AdminStandingsForm({ token }) {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [driverInputs, setDriverInputs] = useState({});
  const [teamInputs, setTeamInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ type: "success", message: "" });
  const [driverQuery, setDriverQuery] = useState("");
  const [teamQuery, setTeamQuery] = useState("");
  const [sortBy, setSortBy] = useState("pointsDesc"); 

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "success", message: "" }), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [driverRes, teamRes] = await Promise.all([
          axios.get("/api/standings/drivers"),
          axios.get("/api/standings/teams"),
        ]);

        const driverData = Array.isArray(driverRes.data) ? driverRes.data : [];
        const teamData = Array.isArray(teamRes.data) ? teamRes.data : [];

        setDrivers(driverData);
        setTeams(teamData);

        const dMap = {};
        driverData.forEach(d => dMap[d.driver] = d.points);
        setDriverInputs(dMap);

        const tMap = {};
        teamData.forEach(t => tMap[t.team] = t.points);
        setTeamInputs(tMap);
      } catch (err) {
        console.error("❌ FETCH FAILED:", err);
        showToast("error", "Failed to load standings");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredDrivers = useMemo(() => {
    let list = [...drivers];
    if (driverQuery) list = list.filter(d => d.driver.toLowerCase().includes(driverQuery.toLowerCase()));
    if (sortBy === "pointsDesc") list.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    else if (sortBy === "nameAsc") list.sort((a, b) => a.driver.localeCompare(b.driver));
    return list;
  }, [drivers, driverQuery, sortBy]);

  const filteredTeams = useMemo(() => {
    let list = [...teams];
    if (teamQuery) list = list.filter(t => t.team.toLowerCase().includes(teamQuery.toLowerCase()));
    if (sortBy === "pointsDesc") list.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    else if (sortBy === "nameAsc") list.sort((a, b) => a.team.localeCompare(b.team));
    return list;
  }, [teams, teamQuery, sortBy]);

  const updateDriver = async (name) => {
    const points = parseInt(driverInputs[name]);
    if (Number.isNaN(points)) return;
    try {
      const res = await axios.put("/api/admin/standing/driver", { driver: name, points }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res?.data?.data;
      setDrivers(drivers.map(d => d.driver === name ? { ...d, points } : d));
      showToast("success", `Saved: ${name} → ${points}`);
    } catch (err) {
      console.error("Driver update failed:", err?.response?.data || err.message);
      showToast("error", `Driver update failed: ${err?.response?.data?.message || "server error"}`);
    }
  };

  const updateTeam = async (name) => {
    const points = parseInt(teamInputs[name]);
    if (Number.isNaN(points)) return;
    try {
      const res = await axios.put("/api/admin/standing/team", { team: name, points }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updated = res?.data?.data;
      setTeams(teams.map(t => t.team === name ? { ...t, points } : t));
      showToast("success", `Saved: ${name} → ${points}`);
    } catch (err) {
      console.error("Team update failed:", err?.response?.data || err.message);
      showToast("error", `Team update failed: ${err?.response?.data?.message || "server error"}`);
    }
  };

  if (loading) return <p style={{ color: "white", padding: 16 }}>Loading…</p>;

  return (
    <>
      <Toast type={toast.type} message={toast.message} />

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
        padding: "16px",
        color: "white"
      }}>
        {/* Controls */}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 12, alignItems: "center" }}>
          <input
            placeholder="Search drivers…"
            value={driverQuery}
            onChange={(e) => setDriverQuery(e.target.value)}
            style={{ padding: "8px 10px", background: "#141414", color: "white", border: "1px solid #333", borderRadius: 8, width: 220 }}
          />
          <input
            placeholder="Search teams…"
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
            style={{ padding: "8px 10px", background: "#141414", color: "white", border: "1px solid #333", borderRadius: 8, width: 220 }}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: "8px 10px", background: "#141414", color: "white", border: "1px solid #333", borderRadius: 8 }}
          >
            <option value="pointsDesc">Sort: Points (high→low)</option>
            <option value="nameAsc">Sort: Name (A→Z)</option>
          </select>
        </div>

        {/* Drivers */}
        <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #222", background: "#121212", fontWeight: 700 }}>Driver Standings</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0 }}>
            {filteredDrivers.map((d) => (
              <div key={d.driver} style={{ display: "contents" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e1e" }}>
                  <div style={{ fontWeight: 600 }}>{d.driver}</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>{d.car || "—"}</div>
                </div>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e1e", display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    value={driverInputs[d.driver] ?? ""}
                    onChange={(e) => setDriverInputs({ ...driverInputs, [d.driver]: e.target.value })}
                    style={{ width: 80, padding: "6px 8px", background: "#1a1a1a", color: "white", border: "1px solid #333", borderRadius: 6 }}
                  />
                  <button
                    onClick={() => updateDriver(d.driver)}
                    style={{ padding: "6px 10px", background: "#19c37d", color: "#04150f", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div style={{ background: "#0d0d0d", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #222", background: "#121212", fontWeight: 700 }}>Team Standings</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0 }}>
            {filteredTeams.map((t) => (
              <div key={t.team} style={{ display: "contents" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e1e", fontWeight: 600 }}>{t.team}</div>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1e1e1e", display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="number"
                    value={teamInputs[t.team] ?? ""}
                    onChange={(e) => setTeamInputs({ ...teamInputs, [t.team]: e.target.value })}
                    style={{ width: 80, padding: "6px 8px", background: "#1a1a1a", color: "white", border: "1px solid #333", borderRadius: 6 }}
                  />
                  <button
                    onClick={() => updateTeam(t.team)}
                    style={{ padding: "6px 10px", background: "#19c37d", color: "#04150f", border: "none", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

