const express = require('express');
const cors = require('cors');
const coinRoutes = require('./routes/coins');
const alertRoutes = require('./routes/alerts');
const alertService = require('./services/alertService');

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/coins', coinRoutes);
app.use('/api/alerts', alertRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Endpoint to get all active alarms
app.get('/api/alarms', (req, res) => {
    try {
        const activeAlarms = alertService.getActiveAlarms();
        res.json(activeAlarms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to stop a specific alarm
app.post('/api/alarms/:id/stop', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'Alert ID is required' });
        }
        
        const alert = alertService.stopAlarm(id);
        
        if (!alert) {
            return res.status(404).json({ error: `Alert with ID ${id} not found` });
        }
        
        res.json({ 
            message: 'Alarm stopped successfully', 
            alert 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Root route - redirect to frontend
app.get('/', (req, res) => {
    const frontendUrl = process.env.NODE_ENV === 'production' 
        ? `http://${req.hostname}:5000` 
        : 'http://localhost:5000';
    res.redirect(frontendUrl);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(`Error: ${err.message}`);
    console.error(err.stack);
    
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'An unexpected error occurred',
            status: err.status || 500
        }
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    
    // Start continuous price monitoring when server starts
    alertService.startContinuousMonitoring();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    alertService.stopContinuousMonitoring();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    alertService.stopContinuousMonitoring();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    alertService.stopContinuousMonitoring();
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
