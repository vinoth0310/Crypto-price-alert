const axios = require('axios');

// Binance API base URL
const BINANCE_API_BASE = 'https://api.binance.com/api/v3';

// Service for interacting with Binance API
const binanceService = {
    // Get detailed information for a specific coin
    getCoinInfo: async (symbol) => {
        try {
            // Ensure symbol is in uppercase and has USDT suffix
            let formattedSymbol = symbol.toUpperCase();
            if (!formattedSymbol.endsWith('USDT')) {
                formattedSymbol += 'USDT';
            }
            
            // Get ticker price
            const tickerResponse = await axios.get(`${BINANCE_API_BASE}/ticker/price`, {
                params: { symbol: formattedSymbol }
            });
            
            // Get 24hr ticker statistics
            const statsResponse = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`, {
                params: { symbol: formattedSymbol }
            });
            
            // Extract the base coin name (remove USDT)
            const baseCoin = formattedSymbol.replace('USDT', '');
            
            // Create formatted coin object
            const coin = {
                symbol: formattedSymbol,
                name: getFullNameFromSymbol(baseCoin),
                price: tickerResponse.data.price,
                priceChangePercent: statsResponse.data.priceChangePercent,
                volume: statsResponse.data.volume,
                high24h: statsResponse.data.highPrice,
                low24h: statsResponse.data.lowPrice,
                lastUpdated: new Date().toISOString()
            };
            
            return coin;
        } catch (error) {
            // Handle case where the symbol doesn't exist
            if (error.response && error.response.status === 400) {
                throw new Error(`Coin symbol ${symbol} not found on Binance`);
            }
            
            console.error(`Failed to fetch coin info for ${symbol}:`, error.message);
            throw new Error(`Failed to fetch coin info: ${error.message}`);
        }
    },
    
    // Get prices for multiple coins at once
    getPrices: async (symbols) => {
        try {
            // Ensure all symbols have USDT suffix
            const formattedSymbols = symbols.map(symbol => {
                let formatted = symbol.toUpperCase();
                if (!formatted.endsWith('USDT')) {
                    formatted += 'USDT';
                }
                return formatted;
            });
            
            // Get all ticker prices
            const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`);
            const allPrices = response.data;
            
            // Filter only requested symbols
            const filteredPrices = allPrices.filter(price => 
                formattedSymbols.includes(price.symbol)
            );
            
            // Get 24hr stats for price changes
            const statsResponse = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`);
            const allStats = statsResponse.data;
            
            // Combine price and stats data
            return filteredPrices.map(price => {
                const stats = allStats.find(stat => stat.symbol === price.symbol) || {};
                return {
                    symbol: price.symbol,
                    price: price.price,
                    priceChangePercent: stats.priceChangePercent || '0.00'
                };
            });
        } catch (error) {
            console.error('Failed to fetch prices:', error.message);
            throw new Error(`Failed to fetch prices: ${error.message}`);
        }
    },
    
    // Get a set of default popular coins
    getDefaultCoins: async () => {
        try {
            const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
            
            // Get ticker prices
            const priceResponse = await axios.get(`${BINANCE_API_BASE}/ticker/price`);
            const allPrices = priceResponse.data;
            
            // Get 24hr stats
            const statsResponse = await axios.get(`${BINANCE_API_BASE}/ticker/24hr`);
            const allStats = statsResponse.data;
            
            // Filter and format default coins
            const defaultCoins = defaultSymbols.map(symbol => {
                const priceData = allPrices.find(p => p.symbol === symbol) || { price: '0' };
                const stats = allStats.find(s => s.symbol === symbol) || { priceChangePercent: '0.00' };
                const baseCoin = symbol.replace('USDT', '');
                
                return {
                    symbol,
                    name: getFullNameFromSymbol(baseCoin),
                    price: priceData.price,
                    priceChangePercent: stats.priceChangePercent
                };
            });
            
            return defaultCoins;
        } catch (error) {
            console.error('Failed to fetch default coins:', error.message);
            throw new Error(`Failed to fetch default coins: ${error.message}`);
        }
    },
    
    // Search for coins by name or symbol
    searchCoins: async (query) => {
        try {
            // Get all ticker prices
            const response = await axios.get(`${BINANCE_API_BASE}/ticker/price`);
            const allPrices = response.data;
            
            // Filter for USDT pairs only and match against query
            const usdtPairs = allPrices.filter(price => 
                price.symbol.endsWith('USDT') && 
                (price.symbol.toLowerCase().includes(query.toLowerCase()))
            );
            
            // Limit to top 10 results
            const limitedResults = usdtPairs.slice(0, 10);
            
            // Format results with names
            return limitedResults.map(price => {
                const baseCoin = price.symbol.replace('USDT', '');
                return {
                    symbol: price.symbol,
                    name: getFullNameFromSymbol(baseCoin),
                    price: price.price
                };
            });
        } catch (error) {
            console.error('Failed to search coins:', error.message);
            throw new Error(`Failed to search coins: ${error.message}`);
        }
    }
};

// Helper function to get full name from symbol
function getFullNameFromSymbol(symbol) {
    const coinNames = {
        'BTC': 'Bitcoin',
        'ETH': 'Ethereum',
        'BNB': 'Binance Coin',
        'ADA': 'Cardano',
        'SOL': 'Solana',
        'XRP': 'Ripple',
        'DOT': 'Polkadot',
        'DOGE': 'Dogecoin',
        'AVAX': 'Avalanche',
        'SHIB': 'Shiba Inu',
        'MATIC': 'Polygon',
        'LTC': 'Litecoin',
        'LINK': 'Chainlink',
        'UNI': 'Uniswap',
        'ALGO': 'Algorand',
        'XLM': 'Stellar',
        'ATOM': 'Cosmos',
        'VET': 'VeChain',
        'AXS': 'Axie Infinity',
        'FTM': 'Fantom'
    };
    
    return coinNames[symbol] || symbol;
}

module.exports = binanceService;
