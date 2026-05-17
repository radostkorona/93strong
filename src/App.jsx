import { useState } from "react";
import DayView from "./components/DayView";
import History from "./components/History";
import ManageActivities from "./components/ManageActivities";

export default function App() {
  const [tab, setTab] = useState("day");

  return (
    <div className="app-wrapper">
      <div className="phone-shell">
        {tab === "day" && <DayView />}
        {tab === "history" && <History />}
        {tab === "manage" && <ManageActivities />}

        {/* Bottom Nav */}
        <nav className="bottom-nav">
          <button
            onClick={() => setTab("day")}
            className={tab === "day" ? "nav-btn active" : "nav-btn"}
          >
            <span>🌸</span>
            <span>Днес</span>
          </button>
          <button
            onClick={() => setTab("history")}
            className={tab === "history" ? "nav-btn active" : "nav-btn"}
          >
            <span>📅</span>
            <span>История</span>
          </button>
          <button
            onClick={() => setTab("manage")}
            className={tab === "manage" ? "nav-btn active" : "nav-btn"}
          >
            <span>⚙️</span>
            <span>Дейности</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
