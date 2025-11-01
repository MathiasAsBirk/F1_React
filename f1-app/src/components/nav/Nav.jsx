import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./Nav.module.css";

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);           // mobile menu
  const [isGamesOpen, setIsGamesOpen] = useState(false); // dropdown
  const dropdownRef = useRef(null);
  const loc = useLocation();

  // active helper
  const isActive = (href) => {
    if (href === "/") return loc.pathname === "/";
    return loc.pathname.startsWith(href);
  };
  const gamesActive = ["/light", "/team", "/f1chess"].some((p) =>
    loc.pathname.startsWith(p)
  );

  // Close dropdown on outside click + ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsGamesOpen(false);
      }
    };
    const onEsc = (e) => e.key === "Escape" && (setIsGamesOpen(false), setIsOpen(false));
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const closeAll = () => { setIsOpen(false); setIsGamesOpen(false); };

  return (
    <>
      <header className={styles.headerRoot}>
        <div className={`${styles.wrapper} ${styles.navFlex}`}>
          <a className={styles.brand} href="/">
            F1<span className={styles.brandLight}>Info</span>
          </a>

          <button
            className={styles.burger}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span/><span/><span/>
          </button>

          <nav className={`${styles.navMenu} ${isOpen ? styles.open : ""}`}>
            <ul className={styles.navList}>
              <li>
                <a
                  className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
                  href="/"
                  onClick={closeAll}
                  aria-current={isActive("/") ? "page" : undefined}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  className={`${styles.navLink} ${isActive("/drivers") ? styles.active : ""}`}
                  href="/drivers"
                  onClick={closeAll}
                  aria-current={isActive("/drivers") ? "page" : undefined}
                >
                  Drivers/Teams
                </a>
              </li>
              <li>
                <a
                  className={`${styles.navLink} ${isActive("/races") ? styles.active : ""}`}
                  href="/races"
                  onClick={closeAll}
                  aria-current={isActive("/races") ? "page" : undefined}
                >
                  Races
                </a>
              </li>
              <li>
                <a
                  className={`${styles.navLink} ${isActive("/standings") ? styles.active : ""}`}
                  href="/standings"
                  onClick={closeAll}
                  aria-current={isActive("/standings") ? "page" : undefined}
                >
                  Standings
                </a>
              </li>
              <li>
                <a
                  className={`${styles.navLink} ${isActive("/news") ? styles.active : ""}`}
                  href="/news"
                  onClick={closeAll}
                  aria-current={isActive("/news") ? "page" : undefined}
                >
                  News
                </a>
              </li>

              {/* Games dropdown */}
              <li className={styles.dropdown} ref={dropdownRef}>
                <button
                  className={`${styles.navLink} ${styles.dropdownToggle} ${gamesActive ? styles.active : ""}`}
                  onClick={() => setIsGamesOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={isGamesOpen}
                >
                  Games
                  <span className={`${styles.caret} ${isGamesOpen ? styles.caretOpen : ""}`} />
                </button>

                <ul className={`${styles.submenu} ${isGamesOpen ? styles.submenuOpen : ""}`} role="menu">
                  <li><a role="menuitem" className={styles.submenuLink} href="/light" onClick={closeAll}>Lights Out (Reaction)</a></li>
                  <li><a role="menuitem" className={styles.submenuLink} href="/team" onClick={closeAll}>F1 Manager</a></li>
                  {/* <li><a role="menuitem" className={styles.submenuLink} href="/f1chess" onClick={closeAll}>F1 Chess</a></li> */}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
        {/* subtle red underline accent */}
        <div className={styles.underline} />
      </header>

      {/* News ticker (no horizontal push, smooth loop) */}
      <div className={styles.ticker} aria-label="Latest headlines">
        <div className={styles.tickerMask}>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerRow}>
              <span className={styles.tickerDot} />
              Formula 1 reveals calendar for 2026 season 
              <span className={styles.tickerDot} />
              All the highlights of the F1 calendar 
              <span className={styles.tickerDot} />
              RACE WEEK: 5 storylines
              <span className={styles.tickerDot} />
              Formula 2 and Formula 3 2026 calendars 
            </div>
            {/* duplicate row for seamless loop */}
            <div className={styles.tickerRow} aria-hidden="true">
              <span className={styles.tickerDot} />
              Formula 1 reveals calendar for 2026 season 
              <span className={styles.tickerDot} />
              All the highlights of the F1 calendar 
              <span className={styles.tickerDot} />
              RACE WEEK: 5 storylines 
              <span className={styles.tickerDot} />
              Formula 2 and Formula 3 2026 calendars 
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
