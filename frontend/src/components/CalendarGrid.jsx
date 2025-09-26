import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { apiUtils } from '../services/api';

// Holiday colors for different types
const HOLIDAY_COLORS = {
  'national': '#3B82F6',     // Blue
  'public': '#EF4444',       // Red  
  'observance': '#F59E0B',   // Amber
  'season': '#10B981',       // Emerald
  'religious': '#8B5CF6',    // Violet
  'default': '#FFFFFF'       // White
};

const CalendarGrid = ({ 
  calendarData, 
  holidays = [], 
  loading, 
  error, 
  onDateClick,
  compact = false  // New prop for compact mode
}) => {
  if (loading) {
    return (
      <div className="calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  // Show a friendly message for years after 2030
  const calendarYear = calendarData?.year;
  if (error) {
    if (calendarYear && calendarYear > 2030) {
      return (
        <div className="calendar-error">
          <div className="error-icon">⚠️</div>
          <p>No calendar data available for years after 2030.</p>
        </div>
      );
    }
    return (
      <div className="calendar-error">
        <div className="error-icon">⚠️</div>
        <p>Error loading calendar</p>
        <small>{error}</small>
      </div>
    );
  }

  if (!calendarData || !calendarData.calendar) {
    return (
      <div className="calendar-empty">
        <p>No calendar data available</p>
      </div>
    );
  }

  // Group holidays by date for quick lookup
  const holidaysByDate = apiUtils.groupHolidaysByDate(holidays);

  // Get holiday color for a specific holiday type
  const getHolidayColor = (holiday) => {
    const type = holiday.primary_type || holiday.type || 'default';
    return HOLIDAY_COLORS[type] || HOLIDAY_COLORS.default;
  };

  // Get the first holiday color for a date (if multiple holidays, show first one)
  const getDateHolidayColor = (dateString) => {
    const dateHolidays = holidaysByDate[dateString];
    if (dateHolidays && dateHolidays.length>0){
      return getHolidayColor(dateHolidays[0]);
    }
    return null;
  };

  // Day names for header
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];



  // Helper: find consecutive holiday sequences in a week
  const getConsecutiveHolidaySequences = (weekDays) => {
    const sequences = [];
    let lastHolidayIdx = -2;
    let consecutive = [];
    weekDays.forEach((day, idx) => {
      const dayHolidays = apiUtils.getHolidaysForDate(day.date, holidaysByDate);
      if (day.isCurrentMonth && dayHolidays.length > 0) {
        if (lastHolidayIdx === idx - 1) {
          consecutive.push(idx);
        } else {
          if (consecutive.length > 1) sequences.push([...consecutive]);
          consecutive = [idx];
        }
        lastHolidayIdx = idx;
      } else {
        if (consecutive.length > 1) sequences.push([...consecutive]);
        consecutive = [];
        lastHolidayIdx = -2;
      }
    });
    if (consecutive.length > 1) sequences.push([...consecutive]);
    return sequences;
  };

  return (
    <div className={`calendar-container ${compact ? 'compact' : ''}`}>
      {/* Calendar Header - Hide in compact mode */}
      {!compact && (
        <div className="calendar-header">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid */}
      <div className={`calendar-grid ${compact ? 'compact' : ''}`}>
        {calendarData && calendarData.calendar ? (
          calendarData.calendar.length > 0 ? (

            calendarData.calendar.map((week, weekIndex) => {
              const currentMonth = calendarData.month;
              const weekHasHolidayInCurrentMonth = week.days.some(day => {
                const dayHolidays = apiUtils.getHolidaysForDate(day.date, holidaysByDate);
                return day.isCurrentMonth && dayHolidays.length > 0;
              });
              const weekColorClass = weekHasHolidayInCurrentMonth ? apiUtils.getWeekColorClass(week.weekColor) : 'week-default';

              // Find consecutive holiday sequences in this week
              const consecutiveSequences = getConsecutiveHolidaySequences(week.days);
              // If any sequence has length >= 3, highlight whole week with white border
              const highlightWholeWeekWhite = consecutiveSequences.some(seq => seq.length >= 3);

              return (
                <div
                  key={weekIndex}
                  className={`calendar-week ${weekColorClass} ${compact ? 'compact' : ''} ${highlightWholeWeekWhite ? 'week-white-border' : ''}`}
                  style={highlightWholeWeekWhite ? { border: '4px solid #fff', boxShadow: '0 0 0 2px #fff8' } : {}}
                >
                  {week.days.map((day, dayIndex) => {
                    const holidayColor = getDateHolidayColor(day.date);
                    const dayHolidays = apiUtils.getHolidaysForDate(day.date, holidaysByDate);
                    const hasActualHoliday = dayHolidays.length > 0;

                    // Is this day part of a consecutive holiday sequence?
                    let isConsecutiveHoliday = false;
                    let consecutiveType = null;
                    consecutiveSequences.forEach(seq => {
                      if (seq.includes(dayIndex)) {
                        isConsecutiveHoliday = true;
                        if (seq.length === 2) consecutiveType = 'yellow';
                        if (seq.length >= 3) consecutiveType = 'white';
                      }
                    });

                    return (
                      <div
                        key={dayIndex}
                        className={`calendar-day ${compact ? 'compact' : ''} ${!day.isCurrentMonth ? 'other-month' : ''} ${
                          day.isToday ? 'today' : ''
                        } ${hasActualHoliday ? 'has-holiday' : ''} ${isConsecutiveHoliday ? 'consecutive-holiday' : ''} ${consecutiveType === 'yellow' ? 'consecutive-yellow' : ''}`}
                        onClick={() => onDateClick?.(day, dayHolidays)}
                        style={{
                          '--holiday-color': holidayColor,
                          border: isConsecutiveHoliday
                            ? consecutiveType === 'yellow'
                              ? '4px solid #FFD600'
                              : highlightWholeWeekWhite
                                ? undefined
                                : '4px solid #fff'
                            : undefined,
                          boxShadow: isConsecutiveHoliday
                            ? consecutiveType === 'yellow'
                              ? '0 0 0 2px #FFD60055'
                              : highlightWholeWeekWhite
                                ? undefined
                                : '0 0 0 2px #fff8'
                            : undefined
                        }}
                        title={hasActualHoliday ? 
                          dayHolidays.map(h => h.name).join(', ') : 
                          ''
                        }
                      >
                        <div className={`day-number ${compact ? 'compact' : ''}`}>
                          {day.day}
                        </div>
                        {/* Holiday indicator - Simplified in compact mode */}
                        {hasActualHoliday && !compact && (
                          <div className="holiday-indicator">
                            <div 
                              className="holiday-dot"
                              style={{ backgroundColor: holidayColor }}
                            ></div>
                            {dayHolidays.length > 1 && (
                              <span className="holiday-count">+{dayHolidays.length - 1}</span>
                            )}
                          </div>
                        )}
                        {/* Compact holiday indicator */}
                        {hasActualHoliday && compact && (
                          <div 
                            className="holiday-dot-compact"
                            style={{ backgroundColor: holidayColor }}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          ) : (
            <div className="calendar-empty">No holidays this month.</div>
          )
        ) : (
          <div className="calendar-empty">No holidays this month.</div>
        )}
      </div>

      {/* Calendar Stats - Hide in compact mode */}
      {!compact && (
        <div className="calendar-stats">
          <div className="stat">
            <span className="stat-label">Total Holidays:</span>
            <span className="stat-value">{holidays.length}</span>
          </div>
          {calendarData.weekColorStats && (
            <>
              <div className="stat">
                <span className="stat-label">Light Green Weeks:</span>
                <span className="stat-value">{calendarData.weekColorStats.lightGreenWeeks}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Dark Green Weeks:</span>
                <span className="stat-value">{calendarData.weekColorStats.darkGreenWeeks}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Holiday details modal/tooltip component
export const HolidayDetails = ({ holidays, date, onClose }) => {
  if (!holidays || holidays.length === 0) return null;

  const formatDate = (dateStr) => {
    const date = apiUtils.safeDateParse(dateStr);
    return date ? date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : dateStr;
  };

  return (
    <div className="holiday-details-overlay" onClick={onClose}>
      <div className="holiday-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Holidays - {formatDate(date)}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          {holidays.map((holiday, index) => (
            <div key={index} className="holiday-item">
              <div className="holiday-info">
                <h4 className="holiday-name">{holiday.name}</h4>
                <p className="holiday-description">{holiday.description}</p>
                <div className="holiday-meta">
                  <span 
                    className="holiday-type"
                    style={{ backgroundColor: HOLIDAY_COLORS[holiday.primary_type || holiday.type] || HOLIDAY_COLORS.default }}
                  >
                    {holiday.primary_type || holiday.type}
                  </span>
                  {holiday.locations && holiday.locations !== 'All' && (
                    <span className="holiday-locations">📍 {holiday.locations}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Week color legend component
export const WeekColorLegend = () => {
  return (
    <div className="week-color-legend">
      <h4>Calendar Legend</h4>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-color week-default"></div>
          <span>No holidays</span>
        </div>
        <div className="legend-item">
          <div className="legend-color week-light-holiday" style={{ backgroundColor: '#88E788' }}></div>
          <span>1 holiday (light green)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color week-very-dark-holiday" style={{ backgroundColor: '#06402B' }}></div>
          <span>2+ holidays (dark green)</span>
        </div>
        <div className="legend-item">
          <div className="holiday-dot" style={{ backgroundColor: '#EF4444', width: '16px', height: '16px' }}></div>
          <span>Holiday dates (red background)</span>
        </div>
      </div>
    </div>
  );
};

// Holiday type legend component
export const HolidayTypeLegend = ({ holidays }) => {
  if (!holidays || holidays.length === 0) return null;

  // Get unique holiday types from current holidays
  const holidayTypes = [...new Set(
    holidays.map(h => h.primary_type || h.type || 'default')
  )];

  return (
    <div className="holiday-type-legend">
      <h4>Holiday Types</h4>
      <div className="legend-items">
        {holidayTypes.map(type => (
          <div key={type} className="legend-item">
            <div 
              className="legend-color holiday-dot"
              style={{ backgroundColor: HOLIDAY_COLORS[type] || HOLIDAY_COLORS.default }}
            ></div>
            <span>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Compact Calendar component specifically for quarterly view
export const CompactCalendar = ({ calendarData, holidays = [], onDateClick }) => {
  if (!calendarData || !calendarData.calendar) {
    return (
      <div className="compact-calendar-empty">
        <p>No data</p>
      </div>
    );
  }

  const holidaysByDate = apiUtils.groupHolidaysByDate(holidays);

  const getHolidayColor = (holiday) => {
    const type = holiday.primary_type || holiday.type || 'default';
    return HOLIDAY_COLORS[type] || HOLIDAY_COLORS.default;
  };

  const getDateHolidayColor = (dateString) => {
    const dateHolidays = holidaysByDate[dateString];
    if (dateHolidays && dateHolidays.length > 0) {
      return getHolidayColor(dateHolidays[0]);
    }
    return null;
  };

  return (
    <div className="compact-calendar">
      {/* Compact day names header */}
      <div className="compact-calendar-header">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div key={index} className="compact-day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Compact calendar grid */}
      <div className="compact-calendar-grid">
        {calendarData.calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="compact-calendar-week">
            {week.days.map((day, dayIndex) => {
              const holidayColor = getDateHolidayColor(day.date);
              const dayHolidays = apiUtils.getHolidaysForDate(day.date, holidaysByDate);
              
              return (
                <div
                  key={dayIndex}
                  className={`compact-calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${
                    day.isToday ? 'today' : ''
                  } ${day.isHoliday ? 'has-holiday' : ''}`}
                  onClick={() => onDateClick?.(day, dayHolidays)}
                  title={dayHolidays.length > 0 ? dayHolidays.map(h => h.name).join(', ') : ''}
                >
                  <span className="compact-day-number">{day.day}</span>
                  {day.isHoliday && (
                    <div 
                      className="compact-holiday-dot"
                      style={{ backgroundColor: holidayColor }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;