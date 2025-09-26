/**
 * Simple in-memory cache implementation
 * For production, consider using Redis or another persistent cache
 */
class Cache {
    constructor() {
        this.cache = new Map();
        this.defaultTTL = parseInt(process.env.CACHE_DURATION) || 3600000; // 1 hour default
        
        // Clean up expired entries every 10 minutes
        setInterval(() => {
            this.cleanup();
        }, 10 * 60 * 1000);
    }

    /**
     * Set a value in cache with TTL
     */
    set(key, value, ttl = null) {
        const expiresAt = Date.now() + (ttl || this.defaultTTL);
        
        this.cache.set(key, {
            value,
            expiresAt,
            createdAt: Date.now()
        });

        console.log(`📦 Cached: ${key} (expires in ${Math.round((expiresAt - Date.now()) / 1000)}s)`);
    }

    /**
     * Get a value from cache
     */
    get(key, includeExpired = false) {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Check if expired
        if (!includeExpired && Date.now() > item.expiresAt) {
            this.cache.delete(key);
            console.log(`📦 Cache expired and removed: ${key}`);
            return null;
        }

        const ageInSeconds = Math.round((Date.now() - item.createdAt) / 1000);
        console.log(`📦 Cache hit: ${key} (age: ${ageInSeconds}s)`);
        
        return item.value;
    }

    /**
     * Delete a specific key from cache
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            console.log(`📦 Cache deleted: ${key}`);
        }
        return deleted;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`📦 Cache cleared: ${size} entries removed`);
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const now = Date.now();
        let validEntries = 0;
        let expiredEntries = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            memoryUsage: this.getMemoryUsage()
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                expiredKeys.push(key);
            }
        }

        expiredKeys.forEach(key => this.cache.delete(key));

        if (expiredKeys.length > 0) {
            console.log(`📦 Cache cleanup: removed ${expiredKeys.length} expired entries`);
        }
    }

    /**
     * Get approximate memory usage of cache
     */
    getMemoryUsage() {
        let totalSize = 0;
        
        for (const [key, item] of this.cache.entries()) {
            totalSize += key.length;
            totalSize += JSON.stringify(item.value).length;
        }

        return {
            bytes: totalSize,
            kb: Math.round(totalSize / 1024),
            mb: Math.round(totalSize / (1024 * 1024))
        };
    }

    /**
     * Check if a key exists (even if expired)
     */
    has(key) {
        return this.cache.has(key);
    }

    /**
     * Get all cache keys
     */
    keys() {
        return Array.from(this.cache.keys());
    }

    /**
     * Prewarm cache with data (useful for frequently accessed data)
     */
    prewarm(data) {
        for (const [key, value] of Object.entries(data)) {
            this.set(key, value);
        }
        console.log(`📦 Cache prewarmed with ${Object.keys(data).length} entries`);
    }
}

module.exports = new Cache();