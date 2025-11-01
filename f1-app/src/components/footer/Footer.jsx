import React from "react";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="foot">
      <div className="footLine" aria-hidden="true" />

      <div className="footGrid">
        <div className="footCol">
          <h4 className="footTitle">F1<span className="footAccent">Info</span></h4>
          <p className="footText">
            Unofficial F1 hub for standings, results, news and a web-based manager sim.
            Built as a school project — purely for learning and fun.
          </p>
        </div>

        <div className="footCol">
          <h4>Quick Links</h4>
          <ul className="footList">
            <li><a href="/drivers">Drivers</a></li>
            <li><a href="/races">Races</a></li>
            <li><a href="/standings">Standings</a></li>
          </ul>
        </div>

        <div className="footCol">
          <h4>Follow</h4>
          <div className="footSocial">
            <a href="#" aria-label="Instagram" title="Instagram" rel="noreferrer">
              <i className="fa-brands fa-instagram" />
            </a>
            <a href="#" aria-label="YouTube" title="YouTube" rel="noreferrer">
              <i className="fa-brands fa-youtube" />
            </a>
          </div>
          <ul className="footList muted">
            <li>Instagram</li>
            <li>YouTube</li>
          </ul>
        </div>

        <div className="footCol">
          <h4>Contact</h4>
          <ul className="footList">
            <li><a href="mailto:info@f1info.com">info@f1info.com</a></li>
            <li>School project · {year}</li>
          </ul>
        </div>
      </div>

      <div className="footBottom">
        © {year} F1Info — Not affiliated with Formula One Group. For educational use only.
      </div>
    </footer>
  );
}
