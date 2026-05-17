import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot, orderBy, query
} from "firebase/firestore";

const USER_ID = "radost";

const ICONS = ["🧘","💧","🚶","📖","🥗","🏃","🌿","😴","🍎","☀️","🧠","💪","🎯","✍️","🛁"];
const TAGS = ["ум","тяло","движение","хранене","хидратация","почивка"];

export default function ManageActivities() {
  const [activities, setActivities] = useState([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🌸");
  const [newTag, setNewTag] = useState("тяло");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "users", USER_ID, "activities"),
      orderBy("order", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const addActivity = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    await addDoc(collection(db, "users", USER_ID, "activities"), {
      name: newName.trim(),
      icon: newIcon,
      tag: newTag,
      order: activities.length,
    });
    setNewName("");
    setNewIcon("🌸");
    setNewTag("тяло");
    setAdding(false);
  };

  const deleteActivity = async (id) => {
    if (window.confirm("Изтрий тази дейност?")) {
      await deleteDoc(doc(db, "users", USER_ID, "activities", id));
    }
  };

  return (
    <div className="manage-view">
      <div className="day-header">
        <h1 className="app-title">93 Strong</h1>
        <p className="app-sub">Моите дейности</p>
      </div>

      {/* Add new */}
      <div className="add-card">
        <div className="add-title">➕ Добави дейност</div>

        <div className="icon-picker">
          {ICONS.map(ic => (
            <button
              key={ic}
              className={`icon-btn ${newIcon === ic ? "selected" : ""}`}
              onClick={() => setNewIcon(ic)}
            >
              {ic}
            </button>
          ))}
        </div>

        <input
          className="add-input"
          placeholder="Напр. Разходка — 30 мин"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addActivity()}
        />

        <div className="tag-picker">
          {TAGS.map(t => (
            <button
              key={t}
              className={`tag-btn ${newTag === t ? "selected" : ""}`}
              onClick={() => setNewTag(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          className={`add-btn ${newName.trim() ? "active" : ""}`}
          onClick={addActivity}
          disabled={adding || !newName.trim()}
        >
          {adding ? "Добавям..." : "Добави"}
        </button>
      </div>

      {/* List */}
      <div className="manage-list">
        {activities.length === 0 && (
          <div className="no-activities">
            <p>Няма добавени дейности все още.</p>
          </div>
        )}
        {activities.map((act) => (
          <div key={act.id} className="manage-item">
            <span className="act-icon">{act.icon}</span>
            <div className="act-body">
              <div className="act-name">{act.name}</div>
              <span className="act-tag-small">{act.tag}</span>
            </div>
            <button className="delete-btn" onClick={() => deleteActivity(act.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
