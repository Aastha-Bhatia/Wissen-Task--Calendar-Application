const express = require('express');
const router = express.Router();
const holidayService = require('../services/holidayService');

/**
 * GET /api/countries
 * Get list of all supported countries
 */
router.get('/', async (req, res) => {
    try {
        console.log('🌍 Fetching supported countries');
        
        const countries = await holidayService.getSupportedCountries();

        // Sort countries alphabetically by name
        countries.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            success: true,
            data: {
                countries,
                totalCountries: countries.length
            },
            message: `Found ${countries.length} supported countries`
        });

    } catch (error) {
        console.error('Error in /countries:', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch countries',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * GET /api/countries/popular
 * Get list of most popular/commonly used countries
 */
router.get('/popular', async (req, res) => {
    try {
        console.log('🌍 Fetching popular countries');
        
        const allCountries = await holidayService.getSupportedCountries();
        
        // Define popular country codes
        const popularCodes = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'JP', 'IN', 'CN', 'BR', 'MX', 'AR', 'ZA'];
        
        // Filter and maintain order
        const popularCountries = popularCodes
            .map(code => allCountries.find(country => country.iso === code))
            .filter(country => country); // Remove any undefined entries

        res.json({
            success: true,
            data: {
                countries: popularCountries,
                totalCountries: popularCountries.length
            },
            message: `Found ${popularCountries.length} popular countries`
        });

    } catch (error) {
        console.error('Error in /countries/popular:', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch popular countries',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * GET /api/countries/search/:query
 * Search countries by name or ISO code
 */
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Query must be at least 2 characters long'
            });
        }

        console.log(`🔍 Searching countries for: ${query}`);
        
        const allCountries = await holidayService.getSupportedCountries();
        const searchQuery = query.trim().toLowerCase();
        
        // Search by name or ISO code
        const matchingCountries = allCountries.filter(country => 
            country.name.toLowerCase().includes(searchQuery) ||
            country.iso.toLowerCase().includes(searchQuery)
        );

        // Sort by relevance (exact matches first, then starts with, then contains)
        matchingCountries.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const aIso = a.iso.toLowerCase();
            const bIso = b.iso.toLowerCase();
            
            // Exact matches first
            if (aName === searchQuery || aIso === searchQuery) return -1;
            if (bName === searchQuery || bIso === searchQuery) return 1;
            
            // Starts with matches
            if (aName.startsWith(searchQuery) || aIso.startsWith(searchQuery)) return -1;
            if (bName.startsWith(searchQuery) || bIso.startsWith(searchQuery)) return 1;
            
            // Alphabetical order for the rest
            return aName.localeCompare(bName);
        });

        res.json({
            success: true,
            data: {
                countries: matchingCountries,
                totalCountries: matchingCountries.length,
                query: query.trim()
            },
            message: `Found ${matchingCountries.length} countries matching '${query.trim()}'`
        });

    } catch (error) {
        console.error('Error in /countries/search/:query:', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to search countries',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * GET /api/countries/:iso
 * Get detailed information about a specific country
 */
router.get('/:iso', async (req, res) => {
    try {
        const { iso } = req.params;
        
        if (!iso || iso.length !== 2) {
            return res.status(400).json({
                success: false,
                message: 'Country ISO code must be 2 characters long'
            });
        }

        console.log(`🌍 Fetching country details for: ${iso.toUpperCase()}`);
        
        const allCountries = await holidayService.getSupportedCountries();
        const country = allCountries.find(c => c.iso.toUpperCase() === iso.toUpperCase());

        if (!country) {
            return res.status(404).json({
                success: false,
                message: `Country with ISO code '${iso.toUpperCase()}' not found`
            });
        }

        // Get current year holidays as sample data
        const currentYear = new Date().getFullYear();
        let sampleHolidays = [];
        
        try {
            sampleHolidays = await holidayService.getHolidays(country.iso, currentYear);
        } catch (error) {
            console.log(`Could not fetch sample holidays for ${country.iso}: ${error.message}`);
        }

        res.json({
            success: true,
            data: {
                country,
                sampleYear: currentYear,
                sampleHolidays: sampleHolidays.slice(0, 5), // First 5 holidays as sample
                totalHolidaysThisYear: sampleHolidays.length
            },
            message: `Country details for ${country.name}`
        });

    } catch (error) {
        console.error('Error in /countries/:iso:', error);
        
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch country details',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;