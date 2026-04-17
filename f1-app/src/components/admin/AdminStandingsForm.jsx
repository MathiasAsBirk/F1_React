import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./AdminStandingsForm.module.css";

/* Simple fixed-position toast — uses data-type for CSS theming */
function Toast({ type = "success", message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} data-type={type}>
      {message}
    </div>
  );
}

export default function AdminStandingsForm({ token }) {
  const [drivers,     setDrivers]     = useState([]);
  const [teams,       setTeams]       = useState([]);
  const [driverInputs, setDriverInputs] = useState({});
  const [teamInputs,   setTeamInputs]   = useState({});
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState({ type: "success", message: "" });
  const [driverQuery, setDriverQuery] = useState("");
  const [teamQuery,   setTeamQuery]   = useState("");
  const [sortBy,      setSortBy]      = useState("pointsDesc");

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast({ type: "success", message: "" }), 2000);
  };

  useEffect(() => {
    (async () => {
      try {
        const [driverRes, teamRes] = await Promise.all([
          axios.get("/api/standings/drivers"),
          axios.get("/api/standings/teams"),
        ]);
        const driverData = Array.isArray(driverRes.data) ? driverRes.data : [];
        const teamData   = Array.isArray(teamRes.data)   ? teamRes.data   : [];

        setDrivers(driverData);
        setTeams(teamData);

        const dMap = {};
        driverData.forEach((d) => { dMap[d.driver] = d.points; });
        setDriverInputs(dMap);

        const tMap = {};
        teamData.forEach((t) => { tMap[t.team] = t.points; });
        setTeamInputs(tMap);
      } catch (err) {
        console.error("Fetch failed:", err);
        showToast("error", "Failed to load standings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredDrivers = useMemo(() => {
    let list = [...drivers];
    if (driverQuery) list = list.filter((d) => d.driver.toLowerCase().includes(driverQuery.toLowerCase()));
    if (sortBy === "pointsDesc") list.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    else if (sortBy === "nameAsc") list.sort((a, b) => a.driver.localeCompare(b.driver));
    return list;
  }, [drivers, driverQuery, sortBy]);

  const filteredTeams = useMemo(() => {
    let list = [...teams];
    if (teamQuery) list = list.filter((t) => t.team.toLowerCase().includes(teamQuery.toLowerCase()));
    if (sortBy === "pointsDesc") list.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    else if (sortBy === "nameAsc") list.sort((a, b) => a.team.localeCompare(b.team));
    return list;
  }, [teams, teamQuery, sortBy]);

  const updateDriver = async (name) => {
    const points = parseInt(driverInputs[name]);
    if (Number.isNaN(points)) return;
    try {
      await axios.put("/api/admin/standing/driver", { driver: name, points }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers((prev) => prev.map((d) => d.driver === name ? { ...d, points } : d));
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
      await axios.put("/api/admin/standing/team", { team: name, points }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams((prev) => prev.map((t) => t.team === name ? { ...t, points } : t));
      showToast("success", `Saved: ${name} → ${points}`);
    } catch (err) {
      console.error("Team update failed:", err?.response?.data || err.message);
      showToast("error", `Team update failed: ${err?.response?.data?.message || "server error"}`);
    }
  };

  if (loading) return <p className={styles.loading}>Loading…</p>;

  return (
    <>
      <Toast type={toast.type} message={toast.message} />

      <div className={styles.grid}>
        {/* Controls */}
        <div className={styles.controls}>
          <input
            className={styles.searchInput}
            placeholder="Search drivers…"
            value={driverQuery}
            onChange={(e) => setDriverQuery(e.target.value)}
          />
          <input
            className={styles.searchInput}
            placeholder="Search teams…"
            value={teamQuery}
            onChange={(e) => setTeamQuery(e.target.value)}
          />
          <select
            className={styles.sortSelect}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="pointsDesc">Sort: Points (high→low)</option>
            <option value="nameAsc">Sort: Name (A→Z)</option>
          </select>
        </div>

        {/* Drivers */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Driver Standings</div>
          <div className={styles.rows}>
            {filteredDrivers.map((d) => (
              <div key={d.driver} className={styles.rowItem}>
                <div className={styles.rowName}>
                  <div className={styles.rowNameStrong}>{d.driver}</div>
                  <div className={styles.rowSub}>{d.car || "—"}</div>
                </div>
                <div className={styles.rowActions}>
                  <input
                    type="number"
                    className={styles.pointsInput}
                    value={driverInputs[d.driver] ?? ""}
                    onChange={(e) => setDriverInputs({ ...driverInputs, [d.driver]: e.target.value })}
                  />
                  <button className={styles.saveBtn} onClick={() => updateDriver(d.driver)}>Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teams */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>Team Standings</div>
          <div className={styles.rows}>
            {filteredTeams.map((t) => (
              <div key={t.team} className={styles.rowItem}>
                <div className={`${styles.rowName} ${styles.rowNameStrong}`}>{t.team}</div>
                <div className={styles.rowActions}>
                  <input
                    type="number"
                    className={styles.pointsInput}
                    value={teamInputs[t.team] ?? ""}
                    onChange={(e) => setTeamInputs({ ...teamInputs, [t.team]: e.target.value })}
                  />
                  <button className={styles.saveBtn} onClick={() => updateTeam(t.team)}>Save</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
