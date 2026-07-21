import { useEffect, useRef, useState } from "react";
import styles from "../styles/News.module.css";
import { STORAGE_KEYS } from "../constants";
import Modal from "../components/ui/Modal";

const STORAGE_KEY = STORAGE_KEYS.NEWS;
const MAX_IMPORT_SIZE = 1_000_000;

function normalizeNewsItem(item) {
  if (!item || typeof item !== "object" || typeof item.title !== "string") return null;
  return {
    id: String(item.id || crypto.randomUUID()),
    title: item.title.slice(0, 180),
    category: String(item.category || "News").slice(0, 40),
    image: String(item.image || "").slice(0, 1_000),
    summary: String(item.summary || "").slice(0, 600),
    content: String(item.content || "").slice(0, 12_000),
    author: String(item.author || "F1Info").slice(0, 80),
    date: String(item.date || "").slice(0, 40),
  };
}

const initialNews = [
  {
    id: "strategy-undercut",
    title: "How the undercut turns tyre life into track position",
    category: "Strategy",
    image: "",
    summary: "Why stopping first can move a driver ahead—and why traffic, warm-up and tyre degradation can make the gamble fail.",
    content: "An undercut begins when a chasing driver pits before the car ahead. Fresh tyres can produce a faster out-lap than the rival's final lap on worn rubber. If the time gained is larger than the original gap, the positions swap when the leading car stops. The move depends on clear traffic, quick tyre warm-up and enough remaining tyre life. Teams also have to consider whether stopping early leaves the driver vulnerable later in the stint.",
    author: "F1Info Editorial",
    date: "2026-01-12",
  },
  {
    id: "setup-balance",
    title: "Why one car setup cannot be fastest everywhere",
    category: "Engineering",
    image: "",
    summary: "Monza rewards low drag, Monaco demands grip, and every setup choice creates a compromise elsewhere.",
    content: "A Formula 1 setup balances aerodynamic load, drag, mechanical grip, tyre temperature and stability. Low-drag wings help on long straights but reduce confidence in fast corners. Softer suspension can improve traction over bumps while making the aerodynamic platform less stable. Engineers use simulation and practice data to find the compromise that best matches the circuit, weather and driver's preferences.",
    author: "F1Info Editorial",
    date: "2026-01-10",
  },
  {
    id: "safety-car",
    title: "What changes when the safety car is deployed",
    category: "Race control",
    image: "",
    summary: "The field compresses, pit stops become cheaper, and strategy teams have seconds to rethink the race.",
    content: "During a safety-car period every driver must slow down, so the time lost by entering the pits becomes smaller relative to cars circulating on track. That can create a valuable opportunity for a tyre change. The field also closes up, removing gaps that drivers built earlier. Teams must consider tyre availability, restart performance, track position and whether the race is likely to resume before making the call.",
    author: "F1Info Editorial",
    date: "2026-01-08",
  },
  {
    id: "championship-points",
    title: "How drivers and constructors score a championship",
    category: "Rules",
    image: "",
    summary: "Two championships run together, but team-mates contribute to them in different ways.",
    content: "Each driver keeps the points they score toward the Drivers' Championship. For the Constructors' Championship, a team combines the points scored by both of its cars. That makes consistency across two drivers especially valuable to a constructor. The championship tables can therefore tell different stories: one outstanding driver may lead the individual contest while another team has the strongest overall pairing.",
    author: "F1Info Editorial",
    date: "2026-01-06",
  },
  {
    id: "tyre-compounds",
    title: "A beginner's guide to Formula 1 tyre compounds",
    category: "Explainer",
    image: "",
    summary: "Soft, medium and hard tyres trade immediate grip against durability over a race stint.",
    content: "Softer tyres usually reach peak grip quickly and produce faster lap times, but they tend to wear sooner. Harder tyres sacrifice some immediate performance for a longer useful life. The best choice depends on track temperature, surface roughness, fuel load and traffic. Teams plan before the race, then adjust as real degradation and changing conditions reveal which compound is working best.",
    author: "F1Info Editorial",
    date: "2026-01-04",
  },
];

export default function News() {
  const [news,       setNews]       = useState(initialNews);
  const [editMode,   setEditMode]   = useState(false);
  const [activeNews, setActiveNews] = useState(null);
  const [editDraft,  setEditDraft]  = useState(null);
  const fileInputRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setNews(parsed.map(normalizeNewsItem).filter(Boolean));
      }
    } catch (e) {
      console.warn("Failed to parse saved news:", e);
    }
  }, []);

  // Persist helper
  const saveNews = (next) => {
    setNews(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
    catch (e) { console.warn("Failed to save news:", e); }
  };

  const openModal = (item) => {
    setActiveNews(item);
    if (editMode) setEditDraft({ ...item });
  };

  const handleSave = () => {
    saveNews(news.map((n) => n.id === editDraft.id ? editDraft : n));
    setActiveNews(null);
    setEditDraft(null);
  };

  const handleCancel = () => { setActiveNews(null); setEditDraft(null); };

  const handleEditChange = (field, value) => setEditDraft((prev) => ({ ...prev, [field]: value }));

  const handleAdd = () => {
    saveNews([{
      id:       crypto.randomUUID(),
      title:    "New headline",
      category: "News",
      image:    "",
      summary:  "Short teaser goes here…",
      content:  "Full article text goes here…",
      author:   "F1.com",
      date:     new Date().toISOString().slice(0, 10),
    }, ...news]);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this news item?")) return;
    saveNews(news.filter((n) => n.id !== id));
    if (activeNews?.id === id) { setActiveNews(null); setEditDraft(null); }
  };

  const handleReset = () => {
    if (!confirm("Reset all news to defaults? This overwrites your edits.")) return;
    saveNews(initialNews);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(news, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `news-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile  = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_SIZE) {
      alert("That file is too large. The maximum import size is 1 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(normalizeNewsItem).filter(Boolean);
          if (!normalized.length) throw new Error("No valid news items");
          saveNews(normalized);
        }
        else { alert("Invalid JSON (expected an array)."); }
      } catch { alert("Failed to parse JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section className={styles.newsWrapper}>
      <h2 className={styles.sectionTitle}>
        F1 Explainers
        <span className={styles.titleActions}>
          <label className={styles.editLabel}>
            <input
              type="checkbox"
              checked={editMode}
              onChange={() => setEditMode(!editMode)}
            />
            Local editor
          </label>

          {editMode && (
            <>
              <button onClick={handleAdd}         className={styles.toolbarBtn}>+ Add</button>
              <button onClick={handleExport}      className={styles.toolbarBtn}>Export JSON</button>
              <button onClick={handleImportClick} className={styles.toolbarBtn}>Import JSON</button>
              <button onClick={handleReset}       className={styles.toolbarBtnGray}>Reset</button>
              <input
                type="file"
                accept="application/json"
                ref={fileInputRef}
                onChange={handleImportFile}
                style={{ display: "none" }}
              />
            </>
          )}
        </span>
      </h2>
      <p className={styles.archiveNote}>Original guides to racing, engineering and strategy. Local editor changes stay in this browser only.</p>

      <div className={styles.newsGrid}>
        {news.map((item) => (
          <article key={item.id} className={styles.card}>
            <button className={styles.cardOpen} onClick={() => openModal(item)} aria-label={`Open article: ${item.title}`}>
              {item.image
                ? <img src={item.image} alt="" className={styles.image} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />
                : <span className={styles.imagePlaceholder} aria-hidden="true">F1INFO</span>}
              <span className={styles.content}>
                <span className={styles.category}>{item.category}</span>
                <strong className={styles.title}>{item.title}</strong>
                <span className={styles.summary}>{item.summary}</span>
              </span>
            </button>
            {editMode && (
              <div className={styles.cardActions}>
                <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>Delete</button>
              </div>
            )}
          </article>
        ))}
      </div>

      {activeNews && (
        <Modal
          overlayClassName={styles.modalOverlay}
          contentClassName={styles.modal}
          onClose={handleCancel}
          labelledBy="news-modal-title"
        >
            {!editMode ? (
              <>
                {activeNews.image && (
                  <img src={activeNews.image} alt={activeNews.title} className={styles.modalImage} />
                )}
                <span className={styles.modalMeta}>
                  {activeNews.date}{activeNews.author ? ` · ${activeNews.author}` : ""}
                </span>
                <h3 id="news-modal-title" className={styles.modalTitle}>{activeNews.title}</h3>
                <p className={styles.modalContent}>{activeNews.content}</p>
                <button className={styles.closeButton} onClick={handleCancel}>Close</button>
              </>
            ) : (
              <>
                <input
                  id="news-modal-title"
                  className={styles.editTitle}
                  aria-label="Article title"
                  value={editDraft.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  placeholder="Title"
                />
                <input
                  className={styles.editField}
                  aria-label="Article category"
                  value={editDraft.category}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  placeholder="Category"
                />
                <input
                  className={styles.editField}
                  aria-label="Article author"
                  value={editDraft.author || ""}
                  onChange={(e) => handleEditChange("author", e.target.value)}
                  placeholder="Author"
                />
                <input
                  className={styles.editField}
                  aria-label="Article image URL"
                  value={editDraft.image || ""}
                  onChange={(e) => handleEditChange("image", e.target.value)}
                  placeholder="Image URL (optional)"
                />
                <input
                  className={styles.editField}
                  aria-label="Article date"
                  value={editDraft.date || ""}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                  placeholder="Date (YYYY-MM-DD or text)"
                />
                <textarea
                  className={styles.editTextarea}
                  aria-label="Article summary"
                  value={editDraft.summary}
                  onChange={(e) => handleEditChange("summary", e.target.value)}
                  rows={2}
                  placeholder="Summary"
                />
                <textarea
                  className={styles.editContent}
                  aria-label="Article content"
                  value={editDraft.content}
                  onChange={(e) => handleEditChange("content", e.target.value)}
                  rows={10}
                  placeholder="Full article content"
                />
                <div className={styles.editActions}>
                  <button className={styles.closeButton} onClick={handleCancel}>Cancel</button>
                  <button className={styles.closeButton} onClick={handleSave}>Save</button>
                </div>
              </>
            )}
        </Modal>
      )}
    </section>
  );
}
