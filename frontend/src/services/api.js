import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Calendar API service
export const calendarAPI = {
  // Get all supported countries
  getCountries: async () => {
    try {
      const response = await api.get('/countries');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch countries');
    }
  },

  // Get popular countries
  getPopularCountries: async () => {
    try {
      const response = await api.get('/countries/popular');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch popular countries');
    }
  },

  // Search countries by name or code
  searchCountries: async (query) => {
    try {
      const response = await api.get(`/countries/search/${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search countries');
    }
  },

  // Get specific country details
  getCountryDetails: async (countryCode) => {
    try {
      const response = await api.get(`/countries/${countryCode}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch country details');
    }
  },

  // Get holidays for a specific month
  getHolidays: async (country, year, month) => {
    try {
      const response = await api.get(`/holidays/${country}/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch holidays');
    }
  },

  // Get complete calendar data with week coloring
  getCalendarData: async (country, year, month) => {
    try {
      const response = await api.get(`/holidays/calendar/${country}/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch calendar data');
    }
  },

  // Get all holidays for a year
  getYearlyHolidays: async (country, year) => {
    try {
      const response = await api.get(`/holidays/${country}/${year}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch yearly holidays');
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await api.get('/health', { baseURL: 'http://localhost:5000' });
      return response.data;
    } catch (error) {
      throw new Error('Backend server is not responding');
    }
  }
};

// Utility functions for API data processing
export const apiUtils = {
  // Format date for API calls
  formatDateForAPI: (date) => {
    return date.toISOString().split('T')[0];
  },

  // Parse API date response (fix timezone issues)
  parseAPIDate: (dateString) => {
    // Create date in local timezone to avoid UTC conversion issues
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  },

  // Safe date parsing for all components
  safeDateParse: (dateString) => {
    if (!dateString) return null;
    if (dateString.includes('T')) {
      // If it's already an ISO string, extract just the date part
      dateString = dateString.split('T')[0];
    }
    const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  },

  // Get week color class name
  getWeekColorClass: (weekColor) => {
    switch (weekColor) {
      case 'light-green':
        return 'week-light-holiday';
      case 'dark-green':
        return 'week-dark-holiday';
      case 'very-dark-green':
        return 'week-very-dark-holiday';
      default:
        return 'week-default';
    }
  },

  // Format holiday for display
  formatHoliday: (holiday) => {
    const parsedDate = apiUtils.safeDateParse(holiday.date);
    return {
      ...holiday,
      date: parsedDate,
      displayDate: parsedDate ? parsedDate.toLocaleDateString() : holiday.date,
    };
  },

  // Group holidays by date
  groupHolidaysByDate: (holidays) => {
    return holidays.reduce((acc, holiday) => {
      const dateKey = holiday.date;
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(holiday);
      return acc;
    }, {});
  },

  // Check if date has holidays
  hasHolidays: (dateString, holidaysByDate) => {
    return holidaysByDate[dateString] && holidaysByDate[dateString].length > 0;
  },

  // Get holidays for specific date
  getHolidaysForDate: (dateString, holidaysByDate) => {
    return holidaysByDate[dateString] || [];
  }
};

export default api;