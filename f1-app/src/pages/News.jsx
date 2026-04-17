import { useEffect, useRef, useState } from "react";
import styles from "../styles/News.module.css";
import { STORAGE_KEYS } from "../constants";

const STORAGE_KEY = STORAGE_KEYS.NEWS;

const initialNews = [
  {
    id: "2",
    title: "HALF TERM REPORT: Haas' best and worst moments from 2025",
    category: "News",
    image: "https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000000/fom-website/2025/Half%20term%20reports%202025/Haas/TEAM%20PREVIEWSHALF%20TERM%20REPORTS%20V1%20(2).webp",
    summary: "As we reach the halfway point of the season, it's time to look back on how Haas' campaign has unfolded so far with their new-for-2025 line-up of Esteban Ocon and Ollie Bearman.",
    content: "After a respectable P7 finish in 2024, Haas currently hold ninth place in the Teams' Championship at the midway point of 2025, a season in which the team have fielded an all-new line-up in Esteban Ocon and Ollie Bearman. Amid a tight midfield battle, can the American outfit find more consistency during the remainder of the campaign? Let's take a look at their half term report…",
    author: "F1.com",
    date: "2025-08-06",
  },
  {
    id: "3",
    title: "IN NUMBERS: 12 stats that show just how gripping the 2025 F1 season has been so far",
    category: "Feature",
    image: "https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000000/fom-website/2025/Miscellaneous/statistics-2025-feature.webp",
    summary: "With the Formula 1 paddock pausing for summer, we take a numerical look at what's happened across the opening half of the year…",
    content: "F1 has put on another must-see show this season, with a fascinating championship battle, ultra-close margins and unexpected results all featuring. As the drivers and teams enjoy their summer break, we run through some telling statistics from the campaign so far ahead of what looks set to be an edge-of-your-seat 10-round run to see out the year…",
    author: "F1.com",
    date: "2025-08-05",
  },
  {
    id: "4",
    title: "HALF TERM REPORT: Alpine's best and worst moments from 2025",
    category: "News",
    image: "https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000000/fom-website/2025/Half%20term%20reports%202025/Alpine/TEAM%20PREVIEWSHALF%20TERM%20REPORTS%20V1.webp",
    summary: "With Alpine currently last in the 2025 Teams' Standings, we sum up their season so far in their half term report.",
    content: "Alpine have had an eventful season so far – again. After something of a rollercoaster 2024 campaign, they went into this year with a pairing of Pierre Gasly and Jack Doohan, only for the rookie Australian to find himself back on the sidelines after the team opted for the services of Franco Colapinto from Imola onwards. However, amid another Team Principal departure, the underlying facts are that Alpine's car isn't quite fast enough this season, leaving the Enstone-based outfit sitting bottom of the Teams' Standings.",
    author: "F1.com",
    date: "2025-08-05",
  },
  {
    id: "5",
    title: "'I'm not too worried' – Verstappen on dropping out of title contention",
    category: "News",
    image: "https://media.formula1.com/image/upload/c_lfill,w_3392/q_auto/v1740000000/fom-website/2025/Red%20Bull/NEW%20F1%20website%20header%20templates.webp",
    summary: "F1.com catches up with reigning four-time World Champion Max Verstappen midway through a rollercoaster 2025 season.",
    content: "Max Verstappen finds himself in territory he's not experienced since 2020 – driving at a high level, but without a car capable of fighting consistently for race wins and the championship.",
    author: "F1.com",
    date: "2025-08-05",
  },
  {
    id: "6",
    title: "Best races, star rookies and drivers under pressure – Our writers reflect on 2025 so far",
    category: "News",
    image: "https://media.formula1.com/image/upload/t_16by9Centre/c_lfill,w_3392/q_auto/v1740000000/fom-website/2025/Miscellaneous/Writers%20on%202025%20header%20image.webp",
    summary: "At the halfway point of the 2025 season, we asked our writers to give us their take on the campaign so far – as well as making some bold predictions for the rest of the year.",
    content: "As Formula 1 embarks on its traditional summer break, now is the perfect time to reflect on what has been an action-packed first half of the season. We asked our writers Lawrence Barretto, Chris Medland, David Tremayne, Alex Jacques and James Hinchcliffe to give us their take on the campaign so far, as well as making some bold predictions for what might happen next.",
    author: "F1.com",
    date: "2025-08-05",
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
        if (Array.isArray(parsed)) setNews(parsed);
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) { saveNews(parsed); }
        else { alert("Invalid JSON (expected an array)."); }
      } catch { alert("Failed to parse JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section className={styles.newsWrapper}>
      <h2 className={styles.sectionTitle}>
        F1 News
        <span className={styles.titleActions}>
          <label className={styles.editLabel}>
            <input
              type="checkbox"
              checked={editMode}
              onChange={() => setEditMode(!editMode)}
            />
            Edit Mode
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

      <div className={styles.newsGrid}>
        {news.map((item) => (
          <div key={item.id} className={styles.card} onClick={() => openModal(item)}>
            <img src={item.image} alt={item.title} className={styles.image} />
            <div className={styles.content}>
              <span className={styles.category}>{item.category}</span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.summary}>{item.summary}</p>
              {editMode && (
                <div className={styles.cardActions}>
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {activeNews && (
        <div className={styles.modalOverlay} onClick={handleCancel}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {!editMode ? (
              <>
                {activeNews.image && (
                  <img src={activeNews.image} alt={activeNews.title} className={styles.modalImage} />
                )}
                <span className={styles.modalMeta}>
                  {activeNews.date}{activeNews.author ? ` · ${activeNews.author}` : ""}
                </span>
                <h3 className={styles.modalTitle}>{activeNews.title}</h3>
                <p className={styles.modalContent}>{activeNews.content}</p>
                <button className={styles.closeButton} onClick={handleCancel}>Close</button>
              </>
            ) : (
              <>
                <input
                  className={styles.editTitle}
                  value={editDraft.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  placeholder="Title"
                />
                <input
                  className={styles.editField}
                  value={editDraft.category}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  placeholder="Category"
                />
                <input
                  className={styles.editField}
                  value={editDraft.date || ""}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                  placeholder="Date (YYYY-MM-DD or text)"
                />
                <textarea
                  className={styles.editTextarea}
                  value={editDraft.summary}
                  onChange={(e) => handleEditChange("summary", e.target.value)}
                  rows={2}
                  placeholder="Summary"
                />
                <textarea
                  className={styles.editContent}
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
          </div>
        </div>
      )}
    </section>
  );
}
