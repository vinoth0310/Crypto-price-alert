const memoryStore = require('../data/memoryStore');
const binanceService = require('./binanceService');

// Service for managing cryptocurrency price alerts
const alertService = {
    // Get all alerts
    getAllAlerts: () => {
        return memoryStore.alerts.getAll();
    },
    
    // Get alerts for a specific coin
    getAlertsBySymbol: (symbol) => {
        if (!symbol) {
            throw new Error('Symbol is required');
        }
        
        return memoryStore.alerts.getAll().filter(alert => 
            alert.symbol.toUpperCase() === symbol.toUpperCase()
        );
    },
    
    // Create a new alert
    createAlert: (alertData) => {
        if (!alertData.symbol || !alertData.targetPrice || !alertData.condition) {
            throw new Error('Symbol, targetPrice, and condition are required');
        }
        
        // Ensure symbol is properly formatted
        let symbol = alertData.symbol.toUpperCase();
        if (!symbol.endsWith('USDT')) {
            symbol += 'USDT';
        }
        
        // Validate condition
        if (!['above', 'below'].includes(alertData.condition)) {
            throw new Error('Condition must be either "above" or "below"');
        }
        
        // Create alert object
        const newAlert = {
            id: Date.now().toString(),
            symbol,
            coinName: alertData.coinName || '',
            targetPrice: parseFloat(alertData.targetPrice),
            condition: alertData.condition,
            active: true,
            createdAt: new Date().toISOString()
        };
        
        // Save to store
        memoryStore.alerts.add(newAlert);
        
        return newAlert;
    },
    
    // Update an existing alert
    updateAlert: (id, alertData) => {
        if (!id) {
            throw new Error('Alert ID is required');
        }
        
        // Get existing alert
        const existingAlert = memoryStore.alerts.getById(id);
        
        if (!existingAlert) {
            return null;
        }
        
        // Update alert properties
        const updatedAlert = {
            ...existingAlert,
            ...alertData,
            // Ensure ID doesn't change
            id: existingAlert.id,
            // Convert targetPrice to float if provided
            targetPrice: alertData.targetPrice ? parseFloat(alertData.targetPrice) : existingAlert.targetPrice,
            // Update timestamp
            updatedAt: new Date().toISOString()
        };
        
        // Save updated alert
        memoryStore.alerts.update(id, updatedAlert);
        
        return updatedAlert;
    },
    
    // Delete an alert
    deleteAlert: (id) => {
        if (!id) {
            throw new Error('Alert ID is required');
        }
        
        return memoryStore.alerts.remove(id);
    },
    
    // Toggle alert active status
    toggleAlertStatus: (id, active) => {
        if (!id) {
            throw new Error('Alert ID is required');
        }
        
        const existingAlert = memoryStore.alerts.getById(id);
        
        if (!existingAlert) {
            return null;
        }
        
        const updatedAlert = {
            ...existingAlert,
            active: active !== undefined ? active : !existingAlert.active,
            updatedAt: new Date().toISOString()
        };
        
        memoryStore.alerts.update(id, updatedAlert);
        
        return updatedAlert;
    },
    
    // Check all active alerts against current prices
    checkAlerts: async () => {
        try {
            const allAlerts = memoryStore.alerts.getAll();
            
            // Get only active alerts
            const activeAlerts = allAlerts.filter(alert => alert.active);
            
            if (activeAlerts.length === 0) {
                return { checked: 0, triggered: 0 };
            }
            
            // Get unique symbols from alerts
            const symbols = [...new Set(activeAlerts.map(alert => alert.symbol))];
            
            // Get current prices for all symbols
            const prices = await binanceService.getPrices(symbols);
            
            let triggeredCount = 0;
            
            // Check each alert
            activeAlerts.forEach(alert => {
                const priceInfo = prices.find(p => p.symbol === alert.symbol);
                
                if (priceInfo) {
                    const currentPrice = parseFloat(priceInfo.price);
                    const targetPrice = parseFloat(alert.targetPrice);
                    
                    let isTriggered = false;
                    
                    if (alert.condition === 'above' && currentPrice >= targetPrice) {
                        isTriggered = true;
                    } else if (alert.condition === 'below' && currentPrice <= targetPrice) {
                        isTriggered = true;
                    }
                    
                    if (isTriggered) {
                        // Mark alert as triggered (inactive)
                        alertService.toggleAlertStatus(alert.id, false);
                        triggeredCount++;
                        
                        // Log alert trigger
                        console.log(`Alert triggered: ${alert.symbol} ${alert.condition} ${targetPrice} (Current: ${currentPrice})`);
                    }
                }
            });
            
            return {
                checked: activeAlerts.length,
                triggered: triggeredCount
            };
        } catch (error) {
            console.error('Error checking alerts:', error.message);
            throw new Error(`Failed to check alerts: ${error.message}`);
        }
    }
};

module.exports = alertService;
