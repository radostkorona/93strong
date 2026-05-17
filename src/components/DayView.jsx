import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, doc, getDoc, setDoc, onSnapshot
} from "firebase/firestore";

const USER_ID = "radost";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayLabel() {
  const days = ["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"];
  const months = ["януари","февруари","март","април","май","юни","юли","август","септември","октомври","ноември","декември"];
  const d = new Date();
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function DayView() {
  const [activities, setActivities] = useState([]);
  const [checked, setChecked] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [celebration, setCelebration] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [subtitleInput, setSubtitleInput] = useState("");

  const todayKey = getTodayKey();

  // Load subtitle
  useEffect(() => {
    const loadSubtitle = async () => {
      const ref = doc(db, "users", USER_ID, "settings", "general");
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().subtitle) {
        setSubtitle(snap.data().subtitle);
      }
    };
    loadSubtitle();
  }, []);

  const saveSubtitle = async () => {
    const ref = doc(db, "users", USER_ID, "settings", "general");
    await setDoc(ref, { subtitle: subtitleInput }, { merge: true });
    setSubtitle(subtitleInput);
    setEditingSubtitle(false);
  };

  // Load activities
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users", USER_ID, "activities"),
      (snap) => {
        const acts = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setActivities(acts);
      }
    );
    return () => unsub();
  }, []);

  // Load today's log
  useEffect(() => {
    const loadLog = async () => {
      const ref = doc(db, "users", USER_ID, "logs", todayKey);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setChecked(data.completions || {});
        setDone(data.done || false);
      }
      setLoading(false);
    };
    loadLog();
  }, [todayKey]);

  const saveLog = async (newChecked, newDone) => {
    const ref = doc(db, "users", USER_ID, "logs", todayKey);
    const total = activities.length;
    const completedCount = Object.values(newChecked).filter(Boolean).length;
    const status = newDone ? "full" : completedCount === 0 ? "none" : completedCount === total ? "full" : "partial";
    await setDoc(ref, {
      completions: newChecked,
      done: newDone,
      status,
      total,
      completedCount,
      date: todayKey,
    });
  };

  const toggleActivity = async (id) => {
    if (done) return;
    const newChecked = { ...checked, [id]: !checked[id] };
    setChecked(newChecked);
    await saveLog(newChecked, false);
  };

  const markDone = async () => {
    const allChecked = activities.every(a => checked[a.id]);
    if (!allChecked) return;
    setDone(true);
    setCelebration(true);
    await saveLog(checked, true);
    setTimeout(() => setCelebration(false), 3000);
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const total = activities.length;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;
  const allDone = total > 0 && completedCount === total;

  const tagColors = {
    "ум": { bg: "rgba(190,140,220,0.35)", color: "#6a2090" },
    "тяло": { bg: "rgba(140,180,240,0.4)", color: "#1a4080" },
    "движение": { bg: "rgba(140,210,170,0.4)", color: "#1a6030" },
    "хранене": { bg: "rgba(240,160,190,0.4)", color: "#8a1050" },
    "хидратация": { bg: "rgba(140,180,240,0.4)", color: "#1a4080" },
    "почивка": { bg: "rgba(240,210,110,0.45)", color: "#7a5000" },
  };

  if (loading) {
    return (
      <div className="day-loading">
        <div className="loading-flower">🌸</div>
        <p>Зареждам...</p>
      </div>
    );
  }

  return (
    <div className="day-view">
      {celebration && (
        <div className="celebration-overlay">
          <div className="celebration-text">🎉 Браво! Денят е завършен! 🌸</div>
        </div>
      )}

      <div className="day-header">
        <h1 className="app-title">93 Strong</h1>

        {editingSubtitle ? (
          <div className="subtitle-edit">
            <input
              className="subtitle-input"
              value={subtitleInput}
              onChange={e => setSubtitleInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && saveSubtitle()}
              autoFocus
              placeholder="Въведи подзаглавие..."
            />
            <div className="subtitle-btns">
              <button className="subtitle-save" onClick={saveSubtitle}>✓</button>
              <button className="subtitle-cancel" onClick={() => setEditingSubtitle(false)}>✕</button>
            </div>
          </div>
        ) : (
          <p
            className="app-sub-italic"
            onClick={() => { setSubtitleInput(subtitle); setEditingSubtitle(true); }}
            title="Кликни за редактиране"
          >
            {subtitle || "✎ Добави подзаглавие..."}
          </p>
        )}

        <div className="date-pill">{getTodayLabel()}</div>
      </div>

      <div className="progress-section">
        <div className="progress-bg">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-label">{completedCount} от {total} изпълнени</div>
      </div>

      <div className="activities-list">
        {activities.length === 0 && (
          <div className="no-activities">
            <p>Няма добавени дейности.</p>
            <p>Отиди в "Дейности" и добави!</p>
          </div>
        )}
        {activities.map((act) => {
          const isChecked = !!checked[act.id];
          const tag = tagColors[act.tag] || { bg: "rgba(200,180,210,0.35)", color: "#5a2060" };
          return (
            <div
              key={act.id}
              className={`activity-card ${isChecked ? "done" : ""}`}
              onClick={() => toggleActivity(act.id)}
            >
              <span className="act-icon">{act.icon}</span>
              <div className="act-body">
                <div className={`act-name ${isChecked ? "done" : ""}`}>{act.name}</div>
                <span className="act-tag" style={{ background: tag.bg, color: tag.color }}>{act.tag}</span>
              </div>
              <div className={`check-circle ${isChecked ? "checked" : ""}`}>
                {isChecked ? "✓" : ""}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={`done-btn ${allDone && !done ? "active" : ""} ${done ? "completed" : ""}`}
        onClick={markDone}
        disabled={done}
      >
        {done ? "🎉 Денят е завършен!" : "✦ Изпълнено за днес"}
      </button>
    </div>
  );
}
