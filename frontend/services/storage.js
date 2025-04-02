// Storage Service for managing local storage
const StorageService = {
    // Keys for local storage
    KEYS: {
        COINS: 'crypto_alert_coins',
        ALERTS: 'crypto_alert_alerts'
    },
    
    // Save coins to local storage
    saveCoins: (coins) => {
        try {
            localStorage.setItem(
                StorageService.KEYS.COINS, 
                JSON.stringify(coins)
            );
            return true;
        } catch (err) {
            console.error('Failed to save coins to local storage:', err);
            return false;
        }
    },
    
    // Get coins from local storage
    getCoins: () => {
        try {
            const coinsJson = localStorage.getItem(StorageService.KEYS.COINS);
            if (!coinsJson) return null;
            return JSON.parse(coinsJson);
        } catch (err) {
            console.error('Failed to get coins from local storage:', err);
            return null;
        }
    },
    
    // Save alerts to local storage
    saveAlerts: (alerts) => {
        try {
            localStorage.setItem(
                StorageService.KEYS.ALERTS, 
                JSON.stringify(alerts)
            );
            return true;
        } catch (err) {
            console.error('Failed to save alerts to local storage:', err);
            return false;
        }
    },
    
    // Get alerts from local storage
    getAlerts: () => {
        try {
            const alertsJson = localStorage.getItem(StorageService.KEYS.ALERTS);
            if (!alertsJson) return [];
            return JSON.parse(alertsJson);
        } catch (err) {
            console.error('Failed to get alerts from local storage:', err);
            return [];
        }
    },
    
    // Clear all app data from local storage
    clearAll: () => {
        try {
            localStorage.removeItem(StorageService.KEYS.COINS);
            localStorage.removeItem(StorageService.KEYS.ALERTS);
            return true;
        } catch (err) {
            console.error('Failed to clear data from local storage:', err);
            return false;
        }
    }
};
