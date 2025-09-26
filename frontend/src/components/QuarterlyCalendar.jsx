import React from "react";
import CalendarGrid from "./CalendarGrid";

export default function QuarterlyCalendar({ calendarData, holidays, loading, error, onDateClick }) {
  if (!calendarData || !calendarData.quarterCalendars) {
    return <div>No quarterly data available</div>;
  }

  return (
    <div style={{ display: "flex", gap: "2rem" }}>
      {calendarData.quarterCalendars.map((monthData, idx) => (
        <div key={idx}>
          <h3>{monthData.monthName}</h3>
          <CalendarGrid
            calendarData={monthData}
            holidays={holidays}
            loading={loading}
            error={error}
            onDateClick={onDateClick}
          />
        </div>
      ))}
    </div>
  );
}