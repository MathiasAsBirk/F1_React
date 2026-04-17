/* ============================================================
   Central constants — import from here instead of re-declaring
   in every file.
   ============================================================ */

/** Base URL for the backend API */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/** localStorage keys — one place to update if keys ever change */
export const STORAGE_KEYS = {
  NEWS:                 "f1_news_v1",
  LIGHTS_OUT_HIGHSCORE: "f1_lightsout_highscore_v1",
  MANAGER_SAVE:         "f1_manager_save_v2",
  MANAGER_SLOTS:        "f1_manager_slots_v1",
};
