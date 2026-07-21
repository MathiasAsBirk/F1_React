import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Nav.module.css";
import { CURRENT_SEASON } from "../../constants";

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
          <Link className={styles.brand} to="/" onClick={closeAll}>
            F1<span className={styles.brandLight}>Info</span>
          </Link>

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
                <Link
                  className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}
                  to="/"
                  onClick={closeAll}
                  aria-current={isActive("/") ? "page" : undefined}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className={`${styles.navLink} ${isActive("/drivers") ? styles.active : ""}`}
                  to="/drivers"
                  onClick={closeAll}
                  aria-current={isActive("/drivers") ? "page" : undefined}
                >
                  Drivers/Teams
                </Link>
              </li>
              <li>
                <Link
                  className={`${styles.navLink} ${isActive("/races") ? styles.active : ""}`}
                  to="/races"
                  onClick={closeAll}
                  aria-current={isActive("/races") ? "page" : undefined}
                >
                  Races
                </Link>
              </li>
              <li>
                <Link
                  className={`${styles.navLink} ${isActive("/standings") ? styles.active : ""}`}
                  to="/standings"
                  onClick={closeAll}
                  aria-current={isActive("/standings") ? "page" : undefined}
                >
                  Standings
                </Link>
              </li>
              <li>
                <Link
                  className={`${styles.navLink} ${isActive("/news") ? styles.active : ""}`}
                  to="/news"
                  onClick={closeAll}
                  aria-current={isActive("/news") ? "page" : undefined}
                >
                  Guides
                </Link>
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
                  <li><Link role="menuitem" className={styles.submenuLink} to="/light" onClick={closeAll}>Lights Out (Reaction)</Link></li>
                  <li><Link role="menuitem" className={styles.submenuLink} to="/team" onClick={closeAll}>F1 Manager</Link></li>
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
      <div className={styles.ticker} aria-label="F1Info highlights">
        <div className={styles.tickerMask}>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerRow}>
              <span className={styles.tickerDot} />
              Explore the {CURRENT_SEASON} race calendar
              <span className={styles.tickerDot} />
              Compare drivers and constructors
              <span className={styles.tickerDot} />
              Build a team in F1 Manager
              <span className={styles.tickerDot} />
              Test your reaction at Lights Out
            </div>
            {/* duplicate row for seamless loop */}
            <div className={styles.tickerRow} aria-hidden="true">
              <span className={styles.tickerDot} />
              Explore the {CURRENT_SEASON} race calendar
              <span className={styles.tickerDot} />
              Compare drivers and constructors
              <span className={styles.tickerDot} />
              Build a team in F1 Manager
              <span className={styles.tickerDot} />
              Test your reaction at Lights Out
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
