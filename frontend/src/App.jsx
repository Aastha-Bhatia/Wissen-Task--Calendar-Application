import React, { useState } from 'react';
import { useCalendar, useCountries, useAppState } from './hooks/useCalendar';
import CalendarGrid, { HolidayDetails, WeekColorLegend, HolidayTypeLegend } from './components/CalendarGrid';
import QuarterlyView from './components/QuarterlyView';
import CountrySelector from './components/CountrySelector';
import MonthNavigation from './components/MonthNavigation';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Calendar, LayoutGrid } from 'lucide-react';
import './App.css';


function App() {
  // Hooks for managing state
  const calendar = useCalendar('US');
  const countries = useCountries();
  const appState = useAppState();

  // Local state for UI
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [showHolidayDetails, setShowHolidayDetails] = useState(false);
  const [currentView, setCurrentView] = useState('monthly'); // 'monthly' or 'quarterly'
  const [showOnlyHighlightedWeeks, setShowOnlyHighlightedWeeks] = useState(false);

  // Handle date click to show holiday details
  const handleDateClick = (day, dayHolidays) => {
    if (dayHolidays && dayHolidays.length > 0) {
      setSelectedHoliday({
        date: day.date,
        holidays: dayHolidays
      });
      setShowHolidayDetails(true);
    }
  };

  // Close holiday details modal
  const closeHolidayDetails = () => {
    setShowHolidayDetails(false);
    setSelectedHoliday(null);
  };

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="app">
      {/* App Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">
              🗓️ Global Holiday Calendar
            </h1>
            <p className="app-subtitle">
              Explore holidays around the world with color-coded weeks
            </p>
          </div>

          <div className="header-right">
            {/* Connection Status */}
            <div className={`connection-status ${appState.isOnline ? 'online' : 'offline'}`}>
              {appState.isOnline ? (
                <>
                  <Wifi size={16} />
                  <span>Online</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  <span>Offline</span>
                </>
              )}
            </div>

            {/* Backend Health Status */}
            {appState.backendHealth && (
              <div className={`backend-status ${appState.backendHealth.status}`}>
                {appState.backendHealth.status === 'healthy' ? (
                  <>
                    <CheckCircle size={16} />
                    <span>Backend OK</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span>Backend Error</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* View Toggle */}
        <section className="view-toggle-section">
          <div className="view-toggle-container">
            <div className="view-toggle">
              <button
                className={`toggle-button ${currentView === 'monthly' ? 'active' : ''}`}
                onClick={() => handleViewChange('monthly')}
                disabled={calendar.loading}
              >
                <Calendar size={16} />
                <span>Monthly View</span>
              </button>
              
              <button
                className={`toggle-button ${currentView === 'quarterly' ? 'active' : ''}`}
                onClick={() => handleViewChange('quarterly')}
                disabled={calendar.loading}
              >
                <LayoutGrid size={16} />
                <span>Quarterly View</span>
              </button>
            </div>
          </div>
        </section>

        {/* Controls Section */}
        <section className="controls-section">
          <div className="controls-container">
            {/* Country Selector */}
            <div className="control-group">
              <label className="control-label">
                🌍 Select Country
              </label>
              <CountrySelector
                countries={countries.countries}
                popularCountries={countries.popularCountries}
                selectedCountry={calendar.selectedCountry}
                onCountryChange={calendar.changeCountry}
                loading={countries.loading}
                onSearch={countries.searchCountries}
              />
            </div>

            {/* Navigation based on current view */}
            <div className="control-group">
              <label className="control-label">
                {currentView === 'monthly' ? '📅 Navigate Months' : '📊 Navigate Quarters'}
              </label>
              {currentView === 'monthly' ? (
                <MonthNavigation
                  currentDate={calendar.currentDate}
                  onPreviousMonth={calendar.goToPreviousMonth}
                  onNextMonth={calendar.goToNextMonth}
                  onGoToToday={calendar.goToToday}
                  onDateSelect={calendar.goToDate}
                  loading={calendar.loading}
                />
              ) : (
                <div className="quarter-navigation-controls">
                  <div className="nav-buttons">
                    <button
                      className="nav-button"
                      onClick={calendar.goToPreviousQuarter}
                      disabled={calendar.loading}
                      title="Previous quarter"
                    >
                      <Wifi size={16} style={{ transform: 'rotate(90deg)' }} />
                    </button>
                    
                    <button
                      className="today-button"
                      onClick={calendar.goToToday}
                      disabled={calendar.loading}
                      title="Go to current quarter"
                    >
                      <RefreshCw size={14} />
                      <span>This Quarter</span>
                    </button>
                    
                    <button
                      className="nav-button"
                      onClick={calendar.goToNextQuarter}
                      disabled={calendar.loading}
                      title="Next quarter"
                    >
                      <Wifi size={16} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  </div>
                  
                  <div className="quarter-info">
                    <span className="current-quarter">
                      Q{calendar.currentQuarter} {calendar.currentDate.getFullYear()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div className="control-group">
              <button
                className={`refresh-button ${calendar.loading ? 'loading' : ''}`}
                onClick={calendar.refetch}
                disabled={calendar.loading}
                title="Refresh calendar data"
              >
                <RefreshCw size={16} className={calendar.loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </section>


        {/* Calendar/Quarterly Section */}
        <section className="calendar-section">
          <div className="calendar-container">
            {currentView === 'monthly' ? (
              <>
                {/* Checkbox to show only highlighted weeks */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={showOnlyHighlightedWeeks}
                      onChange={e => setShowOnlyHighlightedWeeks(e.target.checked)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Show only highlighted weeks (consecutive holidays)
                  </label>
                </div>
                {/* Monthly Calendar View */}
                <CalendarGrid
                  calendarData={calendar.calendarData}
                  holidays={calendar.holidays}
                  loading={calendar.loading}
                  error={calendar.error}
                  onDateClick={handleDateClick}
                  compact={false}
                  showOnlyHighlightedWeeks={showOnlyHighlightedWeeks}
                />
              </>
            ) : (
              /* Quarterly View */
              <QuarterlyView
                currentDate={calendar.currentDate}
                onPreviousQuarter={calendar.goToPreviousQuarter}
                onNextQuarter={calendar.goToNextQuarter}
                onGoToToday={calendar.goToToday}
                calendarData={calendar.calendarData}
                holidays={calendar.holidays}
                loading={calendar.loading}
                error={calendar.error}
                onDateClick={handleDateClick}
              />
            )}

            {/* Error Display */}
            {calendar.error && (
              <div className="error-banner">
                <AlertTriangle size={20} />
                <div className="error-content">
                  <strong>Error loading calendar data</strong>
                  <p>{calendar.error}</p>
                  <button 
                    className="retry-button"
                    onClick={calendar.refetch}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Legends Section */}
        <section className="legends-section">
          <div className="legends-container">
            {/* Week Color Legend */}
            <WeekColorLegend />

            {/* Holiday Type Legend */}
            {calendar.holidays && calendar.holidays.length > 0 && (
              <HolidayTypeLegend holidays={calendar.holidays} />
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-container">
            <h3>Calendar Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{calendar.holidays?.length || 0}</div>
                <div className="stat-label">
                  {currentView === 'monthly' ? 'Holidays This Month' : 'Holidays This Quarter'}
                </div>
              </div>
              
              {calendar.calendarData?.weekColorStats && currentView === 'monthly' && (
                <>
                  <div className="stat-card light-green">
                    <div className="stat-number">
                      {calendar.calendarData.weekColorStats.lightGreenWeeks}
                    </div>
                    <div className="stat-label">Light Green Weeks</div>
                  </div>
                  
                  <div className="stat-card dark-green">
                    <div className="stat-number">
                      {calendar.calendarData.weekColorStats.darkGreenWeeks}
                    </div>
                    <div className="stat-label">Dark Green Weeks</div>
                  </div>
                </>
              )}
              
              {currentView === 'quarterly' && (
                <>
                  <div className="stat-card">
                    <div className="stat-number">Q{calendar.currentQuarter}</div>
                    <div className="stat-label">Current Quarter</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-number">{Math.ceil((calendar.currentDate.getMonth() + 1) / 3)}</div>
                    <div className="stat-label">Quarter of Year</div>
                  </div>
                </>
              )}
              
              <div className="stat-card">
                <div className="stat-number">{countries.countries.length}</div>
                <div className="stat-label">Countries Available</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Holiday Details Modal */}
      {showHolidayDetails && selectedHoliday && (
        <HolidayDetails
          holidays={selectedHoliday.holidays}
          date={selectedHoliday.date}
          onClose={closeHolidayDetails}
        />
      )}

      {/* App Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <p>
            📅 Powered by <a href="https://calendarific.com" target="_blank" rel="noopener noreferrer">Calendarific API</a>
          </p>
          <p className="last-updated">
            Last updated: {appState.lastUpdated.toLocaleTimeString()} | 
            View: {currentView === 'monthly' ? 'Monthly' : 'Quarterly'} | 
            Quarter: Q{calendar.currentQuarter}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App; 