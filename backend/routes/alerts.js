const express = require('express');
const router = express.Router();
const alertService = require('../services/alertService');

// Get all alerts
router.get('/', (req, res) => {
    try {
        const alerts = alertService.getAllAlerts();
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get alerts for a specific coin
router.get('/coin/:symbol', (req, res) => {
    try {
        const { symbol } = req.params;
        const alerts = alertService.getAlertsBySymbol(symbol);
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new alert
router.post('/', (req, res) => {
    try {
        const alertData = req.body;
        
        // Validate required fields
        if (!alertData.symbol || !alertData.targetPrice || !alertData.condition) {
            return res.status(400).json({ 
                error: 'Missing required fields: symbol, targetPrice, and condition are required' 
            });
        }
        
        // Validate price
        const price = parseFloat(alertData.targetPrice);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({ error: 'Invalid target price' });
        }
        
        // Validate condition
        if (!['above', 'below'].includes(alertData.condition)) {
            return res.status(400).json({ error: 'Condition must be either "above" or "below"' });
        }
        
        const newAlert = alertService.createAlert(alertData);
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update an alert
router.put('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const alertData = req.body;
        
        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'Alert ID is required' });
        }
        
        const updatedAlert = alertService.updateAlert(id, alertData);
        
        if (!updatedAlert) {
            return res.status(404).json({ error: `Alert with ID ${id} not found` });
        }
        
        res.json(updatedAlert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete an alert
router.delete('/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'Alert ID is required' });
        }
        
        const success = alertService.deleteAlert(id);
        
        if (!success) {
            return res.status(404).json({ error: `Alert with ID ${id} not found` });
        }
        
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Toggle alert active status
router.patch('/:id/toggle', (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        
        // Validate ID
        if (!id) {
            return res.status(400).json({ error: 'Alert ID is required' });
        }
        
        // Validate active status
        if (typeof active !== 'boolean') {
            return res.status(400).json({ error: 'Active status must be a boolean' });
        }
        
        const updatedAlert = alertService.toggleAlertStatus(id, active);
        
        if (!updatedAlert) {
            return res.status(404).json({ error: `Alert with ID ${id} not found` });
        }
        
        res.json(updatedAlert);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
