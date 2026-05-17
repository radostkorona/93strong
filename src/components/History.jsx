import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const USER_ID = "radost";

const BG_DAYS = ["нед","пон","вт","ср","чет","пет","съб"];
const BG_MONTHS = ["яну","фев","мар","апр","май","юни","юли","авг","сеп","окт","ное","дек"];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${BG_MONTHS[d.getMonth()]}, ${BG_DAYS[d.getDay()]}`;
}

export default function History() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const q = query(
        collection(db, "users", USER_ID, "logs"),
        orderBy("date", "desc")
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setLogs(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="day-loading">
        <div className="loading-flower">🌸</div>
        <p>Зареждам...</p>
      </div>
    );
  }

  return (
    <div className="history-view">
      <div className="day-header">
        <h1 className="app-title">93 Strong</h1>
        <p className="app-sub">История</p>
      </div>

      {logs.length === 0 && (
        <div className="no-activities">
          <p>Все още няма записи.</p>
          <p>Започни да отмяташ дейности!</p>
        </div>
      )}

      <div className="history-list">
        {logs.map((log) => {
          const status = log.status || "none";
          return (
            <div key={log.id} className="history-item">
              <div className="hist-left">
                <span className="hist-icon">📅</span>
                <span className="hist-date">{formatDate(log.id)}</span>
              </div>
              <div className="hist-right">
                {status === "full" && (
                  <span className="hist-badge badge-full">✓ Пълно</span>
                )}
                {status === "partial" && (
                  <span className="hist-badge badge-partial">
                    ~ Частично ({log.completedCount}/{log.total})
                  </span>
                )}
                {status === "none" && (
                  <span className="hist-badge badge-none">— Пропуснато</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
