/* ============================================================
   Central constants — import from here instead of re-declaring
   in every file.
   ============================================================ */

/** Current real-world data season shown by the information pages. */
export const CURRENT_SEASON = 2026;
export const DEFAULT_GUIDE_COUNT = 5;

/**
 * API base URL. VITE_API_URL may be either the server origin or an /api URL.
 * Same-origin /api is the default so local proxying and production hosting agree.
 */
const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
export const API_URL = !configuredApiUrl
  ? "/api"
  : configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;

/** localStorage keys — one place to update if keys ever change */
export const STORAGE_KEYS = {
  NEWS:                 "f1_guides_v2",
  LIGHTS_OUT_HIGHSCORE: "f1_lightsout_highscore_v1",
  MANAGER_SAVE:         "f1_manager_save_v2",
  MANAGER_SLOTS:        "f1_manager_slots_v1",
};
