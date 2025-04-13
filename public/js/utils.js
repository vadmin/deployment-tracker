/**
 * Utility functions for the Deployment Tracker application
 */

// API Key Management
const ApiKeyUtils = {
    /**
     * Get the stored API key from local storage
     * @returns {string|null} The stored API key or null if not found
     */
    getStoredApiKey: function() {
        return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.API_KEY);
    },
    
    /**
     * Store an API key in local storage
     * @param {string} apiKey - The API key to store
     */
    storeApiKey: function(apiKey) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.API_KEY, apiKey);
    },
    
    /**
     * Get headers with API key for fetch requests
     * @param {string} apiKey - The API key to include in headers
     * @returns {Object} Headers object with Content-Type and X-API-Key
     */
    getApiKeyHeaders: function(apiKey) {
        return {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
        };
    }
};

// UI Utilities
const UIUtils = {
    /**
     * Show a message to the user that auto-hides after a delay
     * @param {string} message - The message to display
     * @param {string} type - The message type ('success' or 'error')
     * @param {HTMLElement} container - The container element to append the message to
     * @param {number} timeout - Time in milliseconds before the message is hidden
     */
    showMessage: function(message, type = 'success', container, timeout = 5000) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `message-${type}`);
        messageDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // Auto-hide after specified timeout
        setTimeout(() => {
            messageDiv.remove();
        }, timeout);
    },
    
    /**
     * Format a date string for display
     * @param {string} dateString - The date string to format
     * @returns {string} Formatted date string
     */
    formatDate: function(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    }
};

// Data Utilities
const DataUtils = {
    /**
     * Sort an array of objects by a specified property
     * @param {Array} array - The array to sort
     * @param {string} property - The property to sort by
     * @param {string} direction - The sort direction ('asc' or 'desc')
     * @returns {Array} The sorted array
     */
    sortArrayByProperty: function(array, property, direction = 'asc') {
        return [...array].sort((a, b) => {
            const valueA = a[property];
            const valueB = b[property];
            
            const directionMultiplier = direction === 'asc' ? 1 : -1;
            
            if (valueA < valueB) return -1 * directionMultiplier;
            if (valueA > valueB) return 1 * directionMultiplier;
            return 0;
        });
    },
    
    /**
     * Filter an array of objects by a property matching a value
     * @param {Array} array - The array to filter
     * @param {string} property - The property to check
     * @param {*} value - The value to match
     * @returns {Array} The filtered array
     */
    filterArrayByProperty: function(array, property, value) {
        return array.filter(item => item[property] === value);
    }
};
