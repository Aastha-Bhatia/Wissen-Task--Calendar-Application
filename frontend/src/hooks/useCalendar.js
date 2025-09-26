import { useState, useEffect } from 'react';
import { calendarAPI } from '../services/api';

// Hook for managing calendar state
export const useCalendar = (initialCountry = 'US') => {
  // Navigate to previous quarter
  const goToPreviousQuarter = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 3, 1));
  };

  // Navigate to next quarter
  const goToNextQuarter = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 3, 1));
  };
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get current year and month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Fetch calendar data
  const fetchCalendarData = async (country, year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📅 Fetching calendar data for ${country}/${year}/${month}`);
      const response = await calendarAPI.getCalendarData(country, year, month);
      
      if (response.success) {
        setCalendarData(response.data);
        setHolidays(response.data.holidays || []);
        console.log(`✅ Calendar data loaded: ${response.data.holidays?.length || 0} holidays`);
      } else {
        throw new Error(response.message || 'Failed to load calendar data');
      }
    } catch (err) {
      console.error('❌ Calendar fetch error:', err);
      setError(err.message);
      setCalendarData(null);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Go to specific month/year
  const goToDate = (year, month) => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Change country
  const changeCountry = (countryCode) => {
    setSelectedCountry(countryCode);
  };

  // Effect to fetch data when country or date changes
  useEffect(() => {
    fetchCalendarData(selectedCountry, currentYear, currentMonth);
  }, [selectedCountry, currentYear, currentMonth]);

  return {
    // State
    selectedCountry,
    currentDate,
    currentYear,
    currentMonth,
    calendarData,
    holidays,
    loading,
    error,

    // Actions
    changeCountry,
    goToPreviousMonth,
    goToNextMonth,
    goToDate,
    goToToday,
    goToPreviousQuarter,
    goToNextQuarter,
    refetch: () => fetchCalendarData(selectedCountry, currentYear, currentMonth)
  };
};

// Hook for managing countries
export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [popularCountries, setPopularCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all countries
  const fetchCountries = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await calendarAPI.getCountries();
      if (response.success) {
        setCountries(response.data.countries || []);
        console.log(`✅ Loaded ${response.data.countries?.length || 0} countries`);
      } else {
        throw new Error(response.message || 'Failed to load countries');
      }
    } catch (err) {
      console.error('❌ Countries fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch popular countries
  const fetchPopularCountries = async () => {
    try {
      const response = await calendarAPI.getPopularCountries();
      if (response.success) {
        setPopularCountries(response.data.countries || []);
        console.log(`✅ Loaded ${response.data.countries?.length || 0} popular countries`);
      }
    } catch (err) {
      console.error('❌ Popular countries fetch error:', err);
    }
  };

  // Search countries
  const searchCountries = async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await calendarAPI.searchCountries(query);
      if (response.success) {
        return response.data.countries || [];
      }
      return [];
    } catch (err) {
      console.error('❌ Country search error:', err);
      return [];
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchCountries();
    fetchPopularCountries();
  }, []);

  return {
    countries,
    popularCountries,
    loading,
    error,
    searchCountries,
    refetch: fetchCountries
  };
};

// Hook for managing application state
export const useAppState = () => {
  const [backendHealth, setBackendHealth] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Check backend health
  const checkBackendHealth = async () => {
    try {
      const response = await calendarAPI.healthCheck();
      setBackendHealth({
        status: 'healthy',
        message: response.message,
        timestamp: new Date()
      });
      console.log('✅ Backend is healthy');
    } catch (err) {
      setBackendHealth({
        status: 'unhealthy',
        message: err.message,
        timestamp: new Date()
      });
      console.error('❌ Backend health check failed:', err);
    }
  };

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkBackendHealth();
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial health check
    checkBackendHealth();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic health checks
  useEffect(() => {
    const interval = setInterval(checkBackendHealth, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  return {
    backendHealth,
    isOnline,
    lastUpdated,
    checkBackendHealth
  };
};