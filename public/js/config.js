/**
 * Application Configuration
 * This file contains global configuration settings for the application.
 */

const APP_CONFIG = {
    // API URL - Change this when deploying to different environments
    API_URL: '/api',
    
    // Default settings
    DEFAULT_SORT_COLUMN: 'Date',
    DEFAULT_SORT_DIRECTION: 'desc',
    
    // Local storage keys
    STORAGE_KEYS: {
        API_KEY: 'api_key'
    }
};

// Prevent modifications to the configuration
Object.freeze(APP_CONFIG);
Object.freeze(APP_CONFIG.STORAGE_KEYS);
