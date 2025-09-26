import React from 'react';
import { format, startOfQuarter, endOfQuarter, eachMonthOfInterval } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

const QuarterlyView = ({ 
  currentDate, 
  onPreviousQuarter, 
  onNextQuarter, 
  onGoToToday,
  onDateSelect,
  calendarData,
  holidays,
  loading,
  error,
  onDateClick
}) => {
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  
  // Get months in the current quarter
  const quarterStart = startOfQuarter(currentDate);
  const quarterEnd = endOfQuarter(currentDate);
  const monthsInQuarter = eachMonthOfInterval({ start: quarterStart, end: quarterEnd });

  // Group holidays by month for each calendar
  const holidaysByMonth = {};
  if (holidays && Array.isArray(holidays)) {
    holidays.forEach(holiday => {
      const month = new Date(holiday.date).getMonth() + 1;
      const year = new Date(holiday.date).getFullYear();
      const key = `${year}-${month}`;
      
      if (!holidaysByMonth[key]) {
        holidaysByMonth[key] = [];
      }
      holidaysByMonth[key].push(holiday);
    });
  }

  // Quarter names
  const quarterNames = {
    1: 'First Quarter (Jan - Mar)',
    2: 'Second Quarter (Apr - Jun)', 
    3: 'Third Quarter (Jul - Sep)',
    4: 'Fourth Quarter (Oct - Dec)'
  };

  const [showOnlyHighlightedWeeks, setShowOnlyHighlightedWeeks] = React.useState(false);

  return (
    <div className="quarterly-view">
      {/* Quarter Navigation */}
      <div className="quarter-navigation">
        <div className="nav-main">
          <button
            className="nav-button"
            onClick={onPreviousQuarter}
            disabled={loading}
            title="Previous quarter"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="current-quarter-display">
            <h2 className="quarter-year-text">
              {quarterNames[currentQuarter]} {currentYear}
            </h2>
          </div>

          <button
            className="nav-button"
            onClick={onNextQuarter}
            disabled={loading}
            title="Next quarter"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="nav-secondary">
          <button
            className="today-button"
            onClick={onGoToToday}
            disabled={loading}
            title="Go to current quarter"
          >
            <RotateCcw size={16} />
            <span>This Quarter</span>
          </button>
        </div>
      </div>

      {/* Checkbox to show only highlighted weeks */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <input
            type="checkbox"
            checked={showOnlyHighlightedWeeks}
            onChange={e => setShowOnlyHighlightedWeeks(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          Show only weeks with holidays (green highlight)
        </label>
      </div>

      {/* Three Month Calendars */}
      <div className="quarter-calendars">
        {monthsInQuarter.map((monthDate, index) => {
          const month = monthDate.getMonth() + 1;
          const year = monthDate.getFullYear();
          const monthKey = `${year}-${month}`;
          const monthHolidays = holidaysByMonth[monthKey] || [];

          // Filter calendarData for this month
          let monthCalendarData = calendarData;
          if (calendarData && Array.isArray(calendarData.months)) {
            monthCalendarData = calendarData.months.find(m => m.year === year && m.month === month) || { calendar: [] };
          }

          return (
            <div key={index} className="month-calendar-container">
              <div className="month-header">
                <h3>{format(monthDate, 'MMMM yyyy')}</h3>
                <span className="holiday-count">
                  {monthHolidays.length} holiday{monthHolidays.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="mini-calendar">
                <CalendarGrid
                  calendarData={monthCalendarData}
                  holidays={monthHolidays}
                  loading={loading}
                  error={error}
                  onDateClick={onDateClick}
                  compact={true}
                  showOnlyHighlightedWeeks={showOnlyHighlightedWeeks}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quarter Statistics */}
      <div className="quarter-stats">
        <div className="stat-card">
          <div className="stat-number">
            {holidays ? holidays.length : 0}
          </div>
          <div className="stat-label">Total Holidays This Quarter</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{currentQuarter}</div>
          <div className="stat-label">Current Quarter</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">{monthsInQuarter.length}</div>
          <div className="stat-label">Months in Quarter</div>
        </div>
      </div>
    </div>
  );
};

export default QuarterlyView;