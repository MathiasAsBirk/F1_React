import { useEffect, useRef, useState } from "react";
import styles from "../styles/F1LightsOut.module.css";

const LS_KEY = "f1_lightsout_highscore_v1";

function Metric({ label, value }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

export default function F1LightsOut() {
  const [phase, setPhase] = useState("idle"); 
  const [lit, setLit] = useState(0);          
  const [round, setRound] = useState(1);      
  const [times, setTimes] = useState([]);     
  const [current, setCurrent] = useState(null);
  const [toast, setToast] = useState("");
  const [bestEver, setBestEver] = useState(() => {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? Number(raw) : null;
  });

  const startMark = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleReact();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  useEffect(() => () => clearAllTimers(), []);

  function clearAllTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function cueToast(msg, ms = 1400) {
    setToast(msg);
    const t = setTimeout(() => setToast(""), ms);
    timers.current.push(t);
  }

  function startRound() {
    clearAllTimers();
    setCurrent(null);
    setLit(0);
    setPhase("countdown");
    cueToast("Get ready…");

    // lights on sequence
    for (let i = 1; i <= 5; i++) {
      const t = setTimeout(() => setLit(i), 600 * i);
      timers.current.push(t);
    }

    // random lights-out delay after 5th light
    const randomDelay = 1000 + Math.random() * 1500; 
    const totalToOut = 600 * 5 + randomDelay;

    // arm just before lights out (anti-jump)
    const tArm = setTimeout(() => setPhase("ready"), 600 * 5 - 80);
    timers.current.push(tArm);

    // lights out
    const tGo = setTimeout(() => {
      setLit(0);
      setPhase("go");
      startMark.current = performance.now();
      cueToast("GO GO GO!");
    }, totalToOut);
    timers.current.push(tGo);
  }

  function handleReact() {
    if (phase === "go") {
      const rt = performance.now() - startMark.current;
      setCurrent(rt);
      setPhase("result");
      cueToast(`Reaction: ${rt.toFixed(0)} ms`);

      const nextTimes = [...times];
      nextTimes[round - 1] = rt;
      setTimes(nextTimes);

      if (!bestEver || rt < bestEver) {
        localStorage.setItem(LS_KEY, String(rt));
        setBestEver(rt);
      }

      const t = setTimeout(() => {
        if (round < 5) {
          setRound((r) => r + 1);
          setPhase("idle");
        }
      }, 1200);
      timers.current.push(t);
      return;
    }

    if (phase === "countdown" || phase === "ready") {
      const nextTimes = [...times];
      nextTimes[round - 1] = "JUMP";
      setTimes(nextTimes);
      setCurrent("JUMP");
      setPhase("result");
      cueToast("Jump start! +10s penalty");

      const t = setTimeout(() => {
        if (round < 5) {
          setRound((r) => r + 1);
          setPhase("idle");
        }
      }, 1200);
      timers.current.push(t);
      return;
    }

    if (phase === "idle") cueToast("Press START to begin");
    if (phase === "result") cueToast("Next round…");
  }

  function resetSession() {
    clearAllTimers();
    setPhase("idle");
    setLit(0);
    setRound(1);
    setTimes([]);
    setCurrent(null);
    cueToast("Session reset");
  }

  function clearBest() {
    localStorage.removeItem(LS_KEY);
    setBestEver(null);
    cueToast("Best cleared");
  }

  const finished = round > 5;
  const numericTimes = times.filter((t) => typeof t === "number");
  const average =
    numericTimes.length > 0
      ? Math.round(numericTimes.reduce((a, b) => a + b, 0) / numericTimes.length)
      : null;
  const jumpCount = times.filter((t) => t === "JUMP").length;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>🏁 F1 Lights Out</h1>
            <div className={styles.subtitle}>
              {finished
                ? "Session complete"
                : phase === "go"
                ? "Hit SPACE / CLICK now!"
                : phase === "countdown"
                ? "Lights coming on…"
                : phase === "ready"
                ? "Armed… don’t jump!"
                : "Press START to begin"}
            </div>
          </div>
          <div className={styles.btnRow}>
            <button onClick={resetSession} className={styles.btn}>Reset</button>
            <button onClick={clearBest} className={`${styles.btn} ${styles.btnAlt}`}>Clear Best</button>
          </div>
        </header>

        {/* Lights */}
        <div className={styles.lightsWrap}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`${styles.lightDot} ${
                phase === "go"
                  ? styles.lightGo
                  : i < lit
                  ? styles.lightOn
                  : styles.lightOff
              }`}
            />
          ))}
        </div>

        {/* Panel */}
        <div className={styles.panel}>
          <div className={styles.metrics}>
            <Metric label="Round" value={`${Math.min(round, 5)} / 5`} />
            <Metric
              label="Last"
              value={
                current === "JUMP"
                  ? "JUMP"
                  : current != null
                  ? `${Math.round(current)} ms`
                  : "—"
              }
            />
            <Metric label="Average" value={average != null ? `${average} ms` : "—"} />
            <Metric label="Best ever" value={bestEver ? `${Math.round(bestEver)} ms` : "—"} />
            <Metric label="Jump starts" value={jumpCount} />
          </div>

          <div className={styles.actionRow}>
            <button
              onClick={phase === "idle" ? startRound : handleReact}
              className={`${styles.cta} ${
                phase === "go" ? styles.ctaGo : phase === "idle" ? styles.ctaStart : styles.ctaHold
              }`}
            >
              {phase === "idle" ? "START" : phase === "go" ? "REACT!" : "CLICK / SPACE"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className={styles.tableWrap}>
          <h3 className={styles.tableTitle}>Session Times</h3>
          <div className={styles.tableGrid}>
            {Array.from({ length: 5 }).map((_, i) => {
              const val = times[i];
              return (
                <div key={i} className={styles.row}>
                  <div className={styles.cellHead}>Lap {i + 1}</div>
                  <div className={styles.cell}>
                    {val === "JUMP"
                      ? "JUMP (+10000 ms)"
                      : typeof val === "number"
                      ? `${Math.round(val)} ms`
                      : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toast */}
        {toast && <div className={styles.toastBox}>{toast}</div>}
      </div>
    </div>
  );
}
