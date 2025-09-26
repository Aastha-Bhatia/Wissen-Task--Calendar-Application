const axios = require('axios');
const cache = require('../utils/cache');

class HolidayService {
    constructor() {
        this.apiKey = process.env.CALENDARIFIC_API_KEY;
        this.baseUrl = process.env.CALENDARIFIC_BASE_URL || 'https://calendarific.com/api/v2';
        
        if (!this.apiKey || this.apiKey === 'your_api_key_here') {
            console.warn('⚠️  Calendarific API key not configured. Please add CALENDARIFIC_API_KEY to your .env file');
        }
    }

    /**
     * Get holidays for a specific country, year, and optionally month
     */
    async getHolidays(country, year, month = null) {
        try {
            // Create cache key
            const cacheKey = `holidays_${country}_${year}_${month || 'all'}`;
            
            // Check cache first
            const cachedData = cache.get(cacheKey);
            if (cachedData) {
                console.log(`📦 Cache hit for ${cacheKey}`);
                return cachedData;
            }

            // Validate inputs
            if (!this.apiKey || this.apiKey === 'your_api_key_here') {
                throw new Error('Calendarific API key is not configured');
            }

            if (!country || !year) {
                throw new Error('Country and year are required');
            }

            // Build API request parameters
            const params = {
                api_key: this.apiKey,
                country: country.toLowerCase(),
                year: year,
                type: 'national'  // Only get national holidays
            };

            // Add month filter if specified
            if (month) {
                params.month = month;
            }

            console.log(`🌐 Fetching holidays from Calendarific API: ${country}/${year}/${month || 'all'}`);

            // Make API request
            const response = await axios.get(`${this.baseUrl}/holidays`, {
                params,
                timeout: 10000
            });

            if (response.data.meta.code !== 200) {
                throw new Error(`API Error: ${response.data.meta.error_detail || 'Unknown error'}`);
            }

            // Process and format the holiday data
            const holidays = this.processHolidayData(response.data.response.holidays);

            // Cache the result
            cache.set(cacheKey, holidays);

            console.log(`✅ Successfully fetched ${holidays.length} holidays for ${country}/${year}`);
            return holidays;

        } catch (error) {
            console.error(`❌ Error fetching holidays for ${country}/${year}:`, error.message);
            
            // Return cached data if available, even if expired
            const cacheKey = `holidays_${country}_${year}_${month || 'all'}`;
            const expiredCache = cache.get(cacheKey, true); // Get even expired data
            
            if (expiredCache) {
                console.log('📦 Returning expired cache data due to API error');
                return expiredCache;
            }

            throw error;
        }
    }

    /**
     * Process and format holiday data from the API
     */
    processHolidayData(holidays) {
        return holidays.map(holiday => {
            // Fix timezone issues by creating date in local timezone
            const holidayDate = new Date(holiday.date.iso + 'T12:00:00');
            const dateString = holidayDate.getFullYear() + '-' + 
                             String(holidayDate.getMonth() + 1).padStart(2, '0') + '-' + 
                             String(holidayDate.getDate()).padStart(2, '0');
            
            return {
                date: dateString,
                name: holiday.name,
                description: holiday.description || holiday.name,
                type: holiday.type,
                primary_type: holiday.primary_type,
                canonical_url: holiday.canonical_url || null,
                urlid: holiday.urlid || null,
                locations: holiday.locations || 'All',
                states: holiday.states || 'All'
            };
        });
    }

    /**
     * Get list of supported countries
     */
    async getSupportedCountries() {
        try {
            const cacheKey = 'supported_countries';
            const cachedData = cache.get(cacheKey);
            
            if (cachedData) {
                return cachedData;
            }

            if (!this.apiKey || this.apiKey === 'your_api_key_here') {
                // Return a default list if API key is not configured
                return this.getDefaultCountries();
            }

            console.log('🌐 Fetching supported countries from Calendarific API');

            const response = await axios.get(`${this.baseUrl}/countries`, {
                params: { api_key: this.apiKey },
                timeout: 10000
            });

            if (response.data.meta.code !== 200) {
                throw new Error(`API Error: ${response.data.meta.error_detail || 'Unknown error'}`);
            }

            const countries = response.data.response.countries.map(country => ({
                iso: country['iso-3166'],
                name: country.country_name,
                supported_languages: country.supported_languages,
                flag: `https://flagsapi.com/${country['iso-3166']}/flat/32.png`
            }));

            // Cache for 24 hours
            cache.set(cacheKey, countries, 24 * 60 * 60 * 1000);
            
            return countries;

        } catch (error) {
            console.error('❌ Error fetching countries:', error.message);
            
            // Fallback to default countries
            return this.getDefaultCountries();
        }
    }

    /**
     * Get default list of popular countries
     */
    getDefaultCountries() {
        return [
            { iso: 'US', name: 'United States', flag: 'https://flagsapi.com/US/flat/32.png' },
            { iso: 'CA', name: 'Canada', flag: 'https://flagsapi.com/CA/flat/32.png' },
            { iso: 'GB', name: 'United Kingdom', flag: 'https://flagsapi.com/GB/flat/32.png' },
            { iso: 'FR', name: 'France', flag: 'https://flagsapi.com/FR/flat/32.png' },
            { iso: 'DE', name: 'Germany', flag: 'https://flagsapi.com/DE/flat/32.png' },
            { iso: 'IT', name: 'Italy', flag: 'https://flagsapi.com/IT/flat/32.png' },
            { iso: 'ES', name: 'Spain', flag: 'https://flagsapi.com/ES/flat/32.png' },
            { iso: 'AU', name: 'Australia', flag: 'https://flagsapi.com/AU/flat/32.png' },
            { iso: 'JP', name: 'Japan', flag: 'https://flagsapi.com/JP/flat/32.png' },
            { iso: 'IN', name: 'India', flag: 'https://flagsapi.com/IN/flat/32.png' },
            { iso: 'CN', name: 'China', flag: 'https://flagsapi.com/CN/flat/32.png' },
            { iso: 'BR', name: 'Brazil', flag: 'https://flagsapi.com/BR/flat/32.png' },
            { iso: 'MX', name: 'Mexico', flag: 'https://flagsapi.com/MX/flat/32.png' },
            { iso: 'AR', name: 'Argentina', flag: 'https://flagsapi.com/AR/flat/32.png' },
            { iso: 'ZA', name: 'South Africa', flag: 'https://flagsapi.com/ZA/flat/32.png' }
        ];
    }

    /**
     * Get calendar data for a specific month with holidays and week coloring
     */
    async getCalendarData(country, year, month) {
        try {
            // Get holidays for the month
            const holidays = await this.getHolidays(country, year, month);
            
            // Generate calendar structure
            const calendarData = this.generateCalendarStructure(year, month, holidays);
            
            return {
                country,
                year: parseInt(year),
                month: parseInt(month),
                monthName: new Date(year, month - 1).toLocaleString('en-US', { month: 'long' }),
                holidays,
                calendar: calendarData,
                totalHolidays: holidays.length
            };

        } catch (error) {
            console.error(`❌ Error getting calendar data:`, error.message);
            throw error;
        }
    }

    /**
     * Generate calendar structure with week coloring based on holidays
     */
    generateCalendarStructure(year, month, holidays) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const startDate = new Date(firstDay);
        
        // Adjust to start on Monday (or Sunday based on preference)
        const dayOfWeek = firstDay.getDay();
        startDate.setDate(1 - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

        const weeks = [];
        const holidayDates = new Set(holidays.map(h => h.date));

        while (startDate <= lastDay || weeks.length === 0 || startDate.getDay() !== 1) {
            const week = [];
            const weekDates = [];
            
            for (let i = 0; i < 7; i++) {
                const date = new Date(startDate);
                // Format date consistently to avoid timezone issues
                const dateString = date.getFullYear() + '-' + 
                                 String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(date.getDate()).padStart(2, '0');
                const isCurrentMonth = date.getMonth() === month - 1;
                const isHoliday = holidayDates.has(dateString);
                
                week.push({
                    date: dateString,
                    day: date.getDate(),
                    isCurrentMonth,
                    isHoliday,
                    isToday: dateString === new Date().toISOString().split('T')[0]
                });

                if (isCurrentMonth && isHoliday) {
                    weekDates.push(dateString);
                }

                startDate.setDate(startDate.getDate() + 1);
            }

            // Determine week color based on holidays
            const holidayCount = weekDates.length;
            let weekColor = 'default';
            
            if (holidayCount >= 2) {
                weekColor = 'very-dark-green';  // Changed to very dark green for 2+ holidays
            } else if (holidayCount === 1) {
                weekColor = 'light-green';
            }

            weeks.push({
                days: week,
                holidayCount,
                weekColor,
                weekNumber: this.getWeekNumber(new Date(week[0].date))
            });

            // Break if we've covered the month
            if (startDate.getMonth() > month - 1) break;
        }

        return weeks;
    }

    /**
     * Get week number of the year
     */
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
}

module.exports = new HolidayService();