const memoryStore = require('../data/memoryStore');
const coindcxService = require('./coindcxService');

// Service for managing cryptocurrency price alerts
const alertService = {
    // Store for triggered alerts that have active alarms
    triggeredAlertsWithActiveAlarms: new Set(),
    
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
            triggered: false,
            alarming: false,
            createdAt: new Date().toISOString()
        };
        
        // Save to store
        memoryStore.alerts.add(newAlert);
        
        // Start continuous price monitoring if this is the first alert
        alertService.startContinuousMonitoring();
        
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
        
        // If this alert has an active alarm, stop it
        if (alertService.triggeredAlertsWithActiveAlarms.has(id)) {
            alertService.stopAlarm(id);
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
        
        // If we're deactivating the alert and it has an active alarm, stop the alarm
        if (updatedAlert.active === false && alertService.triggeredAlertsWithActiveAlarms.has(id)) {
            alertService.stopAlarm(id);
        }
        
        memoryStore.alerts.update(id, updatedAlert);
        
        return updatedAlert;
    },
    
    // Mark an alert as triggered and start alarm
    triggerAlert: (alert, currentPrice) => {
        // Update alert status to triggered and alarming
        const updatedAlert = {
            ...alert,
            triggered: true,
            alarming: true,
            triggerPrice: currentPrice,
            triggeredAt: new Date().toISOString()
        };
        
        // Save updated alert
        memoryStore.alerts.update(alert.id, updatedAlert);
        
        // Add to active alarms set
        alertService.triggeredAlertsWithActiveAlarms.add(alert.id);
        
        // Log alert trigger
        console.log(`ALERT TRIGGERED: ${alert.symbol} ${alert.condition} ${alert.targetPrice} (Current: ${currentPrice})`);
        
        return updatedAlert;
    },
    
    // Stop the alarm for a specific alert
    stopAlarm: (id) => {
        const existingAlert = memoryStore.alerts.getById(id);
        
        if (!existingAlert) {
            return null;
        }
        
        // Update alert to stop alarming
        const updatedAlert = {
            ...existingAlert,
            alarming: false,
            alarmStoppedAt: new Date().toISOString()
        };
        
        // Save updated alert
        memoryStore.alerts.update(id, updatedAlert);
        
        // Remove from active alarms set
        alertService.triggeredAlertsWithActiveAlarms.delete(id);
        
        console.log(`Alarm stopped for alert: ${updatedAlert.symbol} ${updatedAlert.condition} ${updatedAlert.targetPrice}`);
        
        return updatedAlert;
    },
    
    // Get all currently triggered alerts with active alarms
    getActiveAlarms: () => {
        return Array.from(alertService.triggeredAlertsWithActiveAlarms).map(id => 
            memoryStore.alerts.getById(id)
        ).filter(alert => alert && alert.alarming);
    },
    
    // Check all active alerts against current prices
    checkAlerts: async () => {
        try {
            const allAlerts = memoryStore.alerts.getAll();
            
            // Get only active alerts that haven't been triggered yet
            const activeAlerts = allAlerts.filter(alert => alert.active && !alert.triggered);
            
            if (activeAlerts.length === 0) {
                return { checked: 0, triggered: 0 };
            }
            
            // Get unique symbols from alerts
            const symbols = [...new Set(activeAlerts.map(alert => alert.symbol))];
            
            // Get current prices for all symbols from CoinDCX
            const prices = await coindcxService.getPrices(symbols);
            
            let triggeredCount = 0;
            let newlyTriggered = [];
            
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
                        // Trigger alarm for this alert
                        const triggered = alertService.triggerAlert(alert, currentPrice);
                        triggeredCount++;
                        newlyTriggered.push(triggered);
                    }
                }
            });
            
            return {
                checked: activeAlerts.length,
                triggered: triggeredCount,
                newlyTriggered
            };
        } catch (error) {
            console.error('Error checking alerts:', error.message);
            throw new Error(`Failed to check alerts: ${error.message}`);
        }
    },
    
    // Variable to store the interval ID
    monitoringInterval: null,
    
    // Start continuous price monitoring at a regular interval
    startContinuousMonitoring: () => {
        // If already monitoring, don't start again
        if (alertService.monitoringInterval) {
            return;
        }
        
        console.log('Starting continuous price monitoring...');
        
        // Check alerts every 30 seconds (can be adjusted as needed)
        alertService.monitoringInterval = setInterval(async () => {
            try {
                const result = await alertService.checkAlerts();
                
                if (result.triggered > 0) {
                    console.log(`${result.triggered} new alerts triggered!`);
                } else {
                    console.log(`Checked ${result.checked} alerts, no new triggers.`);
                }
            } catch (error) {
                console.error('Error in continuous monitoring:', error.message);
            }
        }, 30000); // 30 seconds
    },
    
    // Stop continuous price monitoring
    stopContinuousMonitoring: () => {
        if (alertService.monitoringInterval) {
            clearInterval(alertService.monitoringInterval);
            alertService.monitoringInterval = null;
            console.log('Stopped continuous price monitoring.');
        }
    }
};

module.exports = alertService;
