import React from 'react';
import { apiUtils } from '../services/api';

// Highlight color for consecutive holidays week
const CONSECUTIVE_WEEK_COLOR = '#2563eb'; // blue

function findConsecutiveHolidayWeeks(calendarData, holidays) {
  if (!calendarData || !calendarData.calendar) return [];
  const holidaysByDate = apiUtils.groupHolidaysByDate(holidays);
  const consecutiveWeeks = [];

  calendarData.calendar.forEach((week) => {
    // Get sorted days in week
    const days = week.days.filter(day => day.isCurrentMonth);
    let consecutiveCount = 0;
    let lastHolidayIdx = -2;
    let weekHasConsecutive = false;
    days.forEach((day, idx) => {
      const hasHoliday = apiUtils.getHolidaysForDate(day.date, holidaysByDate).length > 0;
      if (hasHoliday) {
        if (lastHolidayIdx === idx - 1) {
          consecutiveCount++;
        } else {
          consecutiveCount = 1;
        }
        lastHolidayIdx = idx;
        if (consecutiveCount >= 2) {
          weekHasConsecutive = true;
        }
      } else {
        consecutiveCount = 0;
        lastHolidayIdx = -2;
      }
    });
    if (weekHasConsecutive) consecutiveWeeks.push(week);
  });
  return consecutiveWeeks;
}

const ConsecutiveHolidaysView = ({ calendarData, holidays, loading, error, onDateClick, currentDate, onPreviousMonth, onNextMonth, onGoToToday, onDateSelect }) => {
  if (loading) {
    return <div className="calendar-loading"><div className="loading-spinner"></div><p>Loading calendar...</p></div>;
  }
  if (error) {
    return <div className="calendar-error"><div className="error-icon">⚠️</div><p>Error loading calendar</p><small>{error}</small></div>;
  }
  if (!calendarData || !calendarData.calendar){
    return <div className="calendar-empty"><p>No calendar data available</p></div>;
  }

  const consecutiveWeeks = findConsecutiveHolidayWeeks(calendarData, holidays);

  // Always show navigation controls, even if no consecutive holidays
  return (
    <div className="calendar-container consecutive-holidays-view">
      <div className="current-month-year-label" style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 'bold', fontSize: '1.1em' }}>
        {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
      </div>
      <div className="month-navigation">
        <div className="nav-main">
          <button className="nav-button" onClick={() => {
            let year = currentDate.getFullYear();
            let month = currentDate.getMonth() - 1;
            if (month < 0) {
              month = 11;
              year--;
            }
            onDateSelect(new Date(year, month, 1));
          }} disabled={loading} title="Previous month">&#8592;</button>
          <span className="month-year-text">
            <select
              value={currentDate.getMonth()}
              onChange={e => {
                onDateSelect(new Date(currentDate.getFullYear(), Number(e.target.value), 1));
              }}
              disabled={loading}
            >
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx} value={idx}>
                  {new Date(2000, idx, 1).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={currentDate.getFullYear()}
              onChange={e => {
                onDateSelect(new Date(Number(e.target.value), currentDate.getMonth(), 1));
              }}
              disabled={loading}
            >
              {Array.from({ length: 21 }).map((_, idx) => {
                const year = 2020 + idx;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </span>
          <button className="nav-button" onClick={() => {
            let year = currentDate.getFullYear();
            let month = currentDate.getMonth() + 1;
            if (month > 11) {
              month = 0;
              year++;
            }
            onDateSelect(new Date(year, month, 1));
          }} disabled={loading} title="Next month">&#8594;</button>
        </div>
        <div className="nav-secondary">
          <button className="today-button" onClick={onGoToToday} disabled={loading}>Today</button>
        </div>
      </div>
      {consecutiveWeeks.length === 0 ? (
        <div className="calendar-empty"><p>No consecutive holidays found this month.</p></div>
      ) : (
        <div className="calendar-grid">
          {consecutiveWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="calendar-week consecutive-week-highlight">
              {week.days.map((day, dayIndex) => {
                const holidaysByDate = apiUtils.groupHolidaysByDate(holidays);
                const dayHolidays = apiUtils.getHolidaysForDate(day.date, holidaysByDate);
                const hasActualHoliday = dayHolidays.length > 0;
                return (
                  <div
                    key={dayIndex}
                    className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${hasActualHoliday ? 'has-holiday' : ''}`}
                    onClick={() => onDateClick?.(day, dayHolidays)}
                    style={{ backgroundColor: hasActualHoliday ? '#dbeafe' : 'white' }}
                    title={hasActualHoliday ? dayHolidays.map(h => h.name).join(', ') : ''}
                  >
                    <div className="day-number">{day.day}</div>
                    {hasActualHoliday && (
                      <div className="holiday-indicator">
                        <div className="holiday-dot" style={{ backgroundColor: '#2563eb' }}></div>
                        {dayHolidays.length > 1 && (
                          <span className="holiday-count">+{dayHolidays.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
