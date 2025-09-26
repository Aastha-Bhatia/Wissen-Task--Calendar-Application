const express = require('express');
const router = express.Router();
const holidayService = require('../services/holidayService');
const Validator = require('../utils/validator');
const cache = require('../utils/cache');

/**
 * GET /api/holidays/:country/:year
 * Get all holidays for a specific country and year
 */
router.get('/:country/:year', 
    Validator.createValidationMiddleware(params => 
        Validator.validateHolidayRequest(params)
    ),
    async (req, res) => {
        try {
            const { country, year } = req.validated;

            console.log(`📅 Fetching holidays for ${country}/${year}`);
            
            const holidays = await holidayService.getHolidays(country, year);

            res.json({
                success: true,
                data: {
                    country,
                    year,
                    totalHolidays: holidays.length,
                    holidays
                },
                message: `Found ${holidays.length} holidays for ${country} in ${year}`
            });

        } catch (error) {
            console.error('Error in /holidays/:country/:year:', error);
            
            res.status(error.message.includes('API key') ? 503 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch holidays',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * GET /api/holidays/:country/:year/:month
 * Get holidays for a specific country, year, and month
 */
router.get('/:country/:year/:month',
    Validator.createValidationMiddleware(params => 
        Validator.validateHolidayRequest(params)
    ),
    async (req, res) => {
        try {
            const { country, year, month } = req.validated;

            console.log(`📅 Fetching holidays for ${country}/${year}/${month}`);
            
            const holidays = await holidayService.getHolidays(country, year, month);

            res.json({
                success: true,
                data: {
                    country,
                    year,
                    month,
                    monthName: new Date(year, month - 1).toLocaleString('en-US', { month: 'long' }),
                    totalHolidays: holidays.length,
                    holidays
                },
                message: `Found ${holidays.length} holidays for ${country} in ${new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })} ${year}`
            });

        } catch (error) {
            console.error('Error in /holidays/:country/:year/:month:', error);
            
            res.status(error.message.includes('API key') ? 503 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch holidays',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * GET /api/holidays/calendar/:country/:year/:month
 * Get complete calendar data with holiday information and week coloring
 */
router.get('/calendar/:country/:year/:month',
    Validator.createValidationMiddleware(params => 
        Validator.validateHolidayRequest(params)
    ),
    async (req, res) => {
        try {
            const { country, year, month } = req.validated;

            console.log(`📅 Fetching calendar data for ${country}/${year}/${month}`);
            
            const calendarData = await holidayService.getCalendarData(country, year, month);

            // Add metadata about week coloring
            const weekColorStats = {
                totalWeeks: calendarData.calendar.length,
                defaultWeeks: calendarData.calendar.filter(w => w.weekColor === 'default').length,
                lightGreenWeeks: calendarData.calendar.filter(w => w.weekColor === 'light-green').length,
                darkGreenWeeks: calendarData.calendar.filter(w => w.weekColor === 'dark-green').length
            };

            res.json({
                success: true,
                data: {
                    ...calendarData,
                    weekColorStats
                },
                message: `Calendar data for ${calendarData.monthName} ${year} in ${country}`
            });

        } catch (error) {
            console.error('Error in /holidays/calendar/:country/:year/:month:', error);
            
            res.status(error.message.includes('API key') ? 503 : 500).json({
                success: false,
                message: error.message || 'Failed to fetch calendar data',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
);

/**
 * GET /api/holidays/stats/cache
 * Get cache statistics (development only)
 */
router.get('/stats/cache', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'Cache stats only available in development mode'
        });
    }

    const stats = cache.getStats();
    
    res.json({
        success: true,
        data: {
            cache: stats,
            keys: cache.keys(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        },
        message: 'Cache statistics'
    });
});

/**
 * DELETE /api/holidays/cache/:key
 * Clear specific cache key (development only)
 */
router.delete('/cache/:key', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'Cache management only available in development mode'
        });
    }

    const { key } = req.params;
    const deleted = cache.delete(key);
    
    res.json({
        success: true,
        message: deleted ? `Cache key '${key}' deleted` : `Cache key '${key}' not found`
    });
});

/**
 * DELETE /api/holidays/cache
 * Clear all cache (development only)
 */
router.delete('/cache', (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'Cache management only available in development mode'
        });
    }

    cache.clear();
    res.json({
        success: true,
        message: 'All cache cleared'
    });
});

/**
 * POST /api/holidays/prewarm
 * Prewarm cache with popular countries and current year (development only)
 */
router.post('/prewarm', async (req, res) => {
    if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
            success: false,
            message: 'Cache prewarming only available in development mode'
        });
    }

    try {
        const currentYear = new Date().getFullYear();
        const popularCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR'];
        const currentMonth = new Date().getMonth() + 1;

        const prewarmedData = {};

        for (const country of popularCountries) {
            try {
                const holidays = await holidayService.getHolidays(country, currentYear, currentMonth);
                console.log(`✅ Prewarmed ${country}/${currentYear}/${currentMonth}: ${holidays.length} holidays`);
            } catch (error) {
                console.log(`❌ Failed to prewarm ${country}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Cache prewarmed for ${popularCountries.length} countries for ${currentYear}/${currentMonth}`,
            data: {
                countries: popularCountries,
                year: currentYear,
                month: currentMonth
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to prewarm cache',
            error: error.message
        });
    }
});

module.exports = router;