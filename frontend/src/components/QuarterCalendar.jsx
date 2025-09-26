import React, { useState } from "react";
import MonthlyCalendar from "./MonthlyCalendar";
import QuarterlyCalendar from "./QuarterlyCalendar";

export default function QuarterCalendar({ calendarData, holidays, loading, error, onDateClick }) {
  const [view, setView] = useState("monthly");

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setView("monthly")}
          style={{ marginRight: "0.5rem", fontWeight: view === "monthly" ? "bold" : "normal" }}
        >
          Monthly View
        </button>
        <button
          onClick={() => setView("quarterly")}
          style={{ fontWeight: view === "quarterly" ? "bold" : "normal" }}
        >
          Quarterly View
        </button>
      </div>
      {view === "monthly" ? (
        <MonthlyCalendar
          calendarData={calendarData}
          holidays={holidays}
          loading={loading}
          error={error}
          onDateClick={onDateClick}
        />
      ) : (
        <QuarterlyCalendar
          calendarData={calendarData}
          holidays={holidays}
          loading={loading}
          error={error}
          onDateClick={onDateClick}
        />
      )}
    </div>
  );
}