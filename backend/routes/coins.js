const express = require('express');
const router = express.Router();
const coinService = require('../services/coindcxService');

// Get prices for multiple coins
router.get('/prices', async (req, res, next) => {
    try {
        const { symbols } = req.query;
        
        if (!symbols) {
            return res.status(400).json({ error: 'Symbols parameter is required' });
        }
        
        // Split symbols by comma
        const symbolArray = symbols.split(',').map(s => s.trim());
        
        // Get prices for all symbols
        const prices = await coinService.getPrices(symbolArray);
        
        res.json(prices);
    } catch (error) {
        next(error);
    }
});

// Get default coins (popular ones)
router.get('/default', async (req, res, next) => {
    try {
        const defaultCoins = await coinService.getDefaultCoins();
        res.json(defaultCoins);
    } catch (error) {
        next(error);
    }
});

// Search for coins by name or symbol
router.get('/search', async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({ error: 'Search query must be at least 2 characters' });
        }
        
        const results = await coinService.searchCoins(q);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get information for a specific coin (Must be last route due to :symbol being a catch-all)
router.get('/:symbol', async (req, res, next) => {
    try {
        const { symbol } = req.params;
        
        // Validate symbol format
        if (!symbol || typeof symbol !== 'string') {
            return res.status(400).json({ error: 'Invalid symbol parameter' });
        }
        
        const coinInfo = await coinService.getCoinInfo(symbol);
        
        if (!coinInfo) {
            return res.status(404).json({ error: `Coin ${symbol} not found` });
        }
        
        res.json(coinInfo);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
