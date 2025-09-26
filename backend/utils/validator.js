/**
 * Input validation utilities
 */
class Validator {
    
    /**
     * Validate country code (ISO 3166-1 alpha-2)
     */
    static validateCountryCode(country) {
        if (!country) {
            return { valid: false, error: 'Country code is required' };
        }

        if (typeof country !== 'string') {
            return { valid: false, error: 'Country code must be a string' };
        }

        const countryCode = country.trim().toUpperCase();
        
        if (countryCode.length !== 2) {
            return { valid: false, error: 'Country code must be 2 characters long (ISO 3166-1 alpha-2)' };
        }

        if (!/^[A-Z]{2}$/.test(countryCode)) {
            return { valid: false, error: 'Country code must contain only letters' };
        }

        return { valid: true, value: countryCode };
    }

    /**
     * Validate year
     */
    static validateYear(year) {
        if (!year) {
            return { valid: false, error: 'Year is required' };
        }

        const yearNum = parseInt(year);
        
        if (isNaN(yearNum)) {
            return { valid: false, error: 'Year must be a valid number' };
        }

        const currentYear = new Date().getFullYear();
        const minYear = 2000;
        const maxYear = currentYear + 5;

        if (yearNum < minYear || yearNum > maxYear) {
            return { 
                valid: false, 
                error: `Year must be between ${minYear} and ${maxYear}` 
            };
        }

        return { valid: true, value: yearNum };
    }

    /**
     * Validate month
     */
    static validateMonth(month) {
        if (!month) {
            return { valid: false, error: 'Month is required' };
        }

        const monthNum = parseInt(month);
        
        if (isNaN(monthNum)) {
            return { valid: false, error: 'Month must be a valid number' };
        }

        if (monthNum < 1 || monthNum > 12) {
            return { valid: false, error: 'Month must be between 1 and 12' };
        }

        return { valid: true, value: monthNum };
    }

    /**
     * Validate date string (YYYY-MM-DD format)
     */
    static validateDate(dateString) {
        if (!dateString) {
            return { valid: false, error: 'Date is required' };
        }

        if (typeof dateString !== 'string') {
            return { valid: false, error: 'Date must be a string' };
        }

        // Check format YYYY-MM-DD
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(dateString)) {
            return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
        }

        // Check if it's a valid date
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Invalid date' };
        }

        // Check if the date string matches the parsed date
        // (to catch cases like 2024-02-30 which would be parsed as a different date)
        const isoString = date.toISOString().split('T')[0];
        if (isoString !== dateString) {
            return { valid: false, error: 'Invalid date' };
        }

        return { valid: true, value: date };
    }

    /**
     * Sanitize query parameters
     */
    static sanitizeParams(params) {
        const sanitized = {};
        
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string') {
                    sanitized[key] = value.trim();
                } else {
                    sanitized[key] = value;
                }
            }
        }

        return sanitized;
    }

    /**
     * Validate holiday request parameters
     */
    static validateHolidayRequest(params) {
        const errors = [];
        const validated = {};

        // Sanitize params first
        const sanitized = this.sanitizeParams(params);

        // Validate country
        if (sanitized.country) {
            const countryValidation = this.validateCountryCode(sanitized.country);
            if (!countryValidation.valid) {
                errors.push(countryValidation.error);
            } else {
                validated.country = countryValidation.value;
            }
        } else {
            errors.push('Country parameter is required');
        }

        // Validate year
        if (sanitized.year) {
            const yearValidation = this.validateYear(sanitized.year);
            if (!yearValidation.valid) {
                errors.push(yearValidation.error);
            } else {
                validated.year = yearValidation.value;
            }
        } else {
            errors.push('Year parameter is required');
        }

        // Validate month (optional)
        if (sanitized.month) {
            const monthValidation = this.validateMonth(sanitized.month);
            if (!monthValidation.valid) {
                errors.push(monthValidation.error);
            } else {
                validated.month = monthValidation.value;
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            data: validated
        };
    }

    /**
     * Create validation middleware for Express routes
     */
    static createValidationMiddleware(validationFn) {
        return (req, res, next) => {
            const validation = validationFn(req.params);
            
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Attach validated data to request
            req.validated = validation.data;
            next();
        };
    }
}

module.exports = Validator;