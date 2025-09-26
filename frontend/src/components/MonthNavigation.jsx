import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

const MonthNavigation = ({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth, 
  onGoToToday,
  onDateSelect,
  loading 
}) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const today = new Date();
  
  // Format current month/year for display
  const monthYearText = format(currentDate, 'MMMM yyyy');
  
  // Check if we're currently viewing today's month
  const isCurrentMonth = 
    currentYear === today.getFullYear() && 
    currentMonth === today.getMonth();

  // Generate year options (current year ± 5 years)
  const yearOptions = [];
  const startYear = currentYear - 5;
  const endYear = currentYear + 5;
  for (let year = startYear; year <= endYear; year++) {
    yearOptions.push(year);
  }

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleYearChange = (year) => {
    onDateSelect(parseInt(year), currentMonth + 1);
  };

  const handleMonthChange = (monthIndex) => {
    onDateSelect(currentYear, monthIndex + 1);
  };

  return (
    <div className="month-navigation">
      {/* Main Navigation Bar */}
      <div className="nav-main">
        {/* Previous Month Button */}
        <button
          className="nav-button prev-month"
          onClick={onPreviousMonth}
          disabled={loading}
          title="Previous month"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Current Month/Year Display */}
        <div className="current-date-display">
          <h2 className="month-year-text">{monthYearText}</h2>
          <div className="date-badge">
            <Calendar size={16} />
          </div>
        </div>

        {/* Next Month Button */}
        <button
          className="nav-button next-month"
          onClick={onNextMonth}
          disabled={loading}
          title="Next month"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Secondary Controls */}
      <div className="nav-secondary">
        {/* Month Selector */}
        <div className="month-selector">
          <select
            value={currentMonth}
            onChange={(e) => handleMonthChange(parseInt(e.target.value))}
            disabled={loading}
            className="month-select"
            title="Select month"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="year-selector">
          <select
            value={currentYear}
            onChange={(e) => handleYearChange(e.target.value)}
            disabled={loading}
            className="year-select"
            title="Select year"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Go to Today Button */}
        <button
          className={`today-button ${isCurrentMonth ? 'current' : ''}`}
          onClick={onGoToToday}
          disabled={loading || isCurrentMonth}
          title={isCurrentMonth ? "Already viewing current month" : "Go to today"}
        >
          <RotateCcw size={16} />
          <span>Today</span>
        </button>
      </div>

      {/* Quick Navigation (Last 3 months, Next 3 months) */}
      <div className="nav-quick">
        <div className="quick-nav-group">
          <span className="quick-nav-label">Quick:</span>
          <div className="quick-nav-buttons">
            {[-3, -2, -1].map(offset => {
              const offsetDate = new Date(currentYear, currentMonth + offset, 1);
              const isSelected = offset === 0;
              
              return (
                <button
                  key={offset}
                  className={`quick-nav-button ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleMonthChange(currentMonth + offset)}
                  disabled={loading}
                  title={format(offsetDate, 'MMMM yyyy')}
                >
                  {format(offsetDate, 'MMM')}
                </button>
              );
            })}
            
            <span className="current-indicator">•</span>
            
            {[1, 2, 3].map(offset => {
              const offsetDate = new Date(currentYear, currentMonth + offset, 1);
              
              return (
                <button
                  key={offset}
                  className="quick-nav-button"
                  onClick={() => handleMonthChange(currentMonth + offset)}
                  disabled={loading}
                  title={format(offsetDate, 'MMMM yyyy')}
                >
                  {format(offsetDate, 'MMM')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for mobile
export const MonthNavigation_Mobile = ({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth, 
  onGoToToday,
  loading 
}) => {
  const monthYearText = format(currentDate, 'MMM yyyy');
  const today = new Date();
  const isCurrentMonth = 
    currentDate.getFullYear() === today.getFullYear() && 
    currentDate.getMonth() === today.getMonth();

  return (
    <div className="month-navigation-mobile">
      <button
        className="nav-button-mobile"
        onClick={onPreviousMonth}
        disabled={loading}
      >
        <ChevronLeft size={18} />
      </button>

      <div className="current-date-mobile">
        <span className="month-year-mobile">{monthYearText}</span>
      </div>

      <button
        className="nav-button-mobile"
        onClick={onNextMonth}
        disabled={loading}
      >
        <ChevronRight size={18} />
      </button>

      <button
        className={`today-button-mobile ${isCurrentMonth ? 'current' : ''}`}
        onClick={onGoToToday}
        disabled={loading || isCurrentMonth}
      >
        <RotateCcw size={14} />
      </button>
    </div>
  );
};

export default MonthNavigation;