const axios = require('axios');

const COINDCX_API_BASE = 'https://api.coindcx.com';

// Service for interacting with CoinDCX API
const coindcxService = {
    // Get detailed information for a specific coin
    getCoinInfo: async (symbol) => {
        try {
            // Ensure symbol is in uppercase and has USDT suffix if not present
            let formattedSymbol = symbol.toUpperCase();
            if (!formattedSymbol.endsWith('USDT')) {
                formattedSymbol += 'USDT';
            }

            // Get market data
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets`);
            const markets = marketsResponse.data;
            
            // Find market with matching symbol
            const market = markets.find(m => m.symbol === formattedSymbol);
            
            if (!market) {
                return null; // Market not found
            }
            
            // Get ticker data
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            
            // Find ticker with matching market
            const ticker = tickers.find(t => t.market === market.market);
            
            if (!ticker) {
                return null; // Ticker not found
            }
            
            // Extract the base coin name (remove USDT)
            const baseCoin = formattedSymbol.replace('USDT', '');
            
            // Create formatted coin object
            const coin = {
                symbol: formattedSymbol,
                name: getFullNameFromSymbol(baseCoin),
                price: ticker.last_price,
                priceChangePercent: ticker.change_24_hour,
                volume: ticker.volume,
                high24h: ticker.high,
                low24h: ticker.low,
                lastUpdated: new Date().toISOString()
            };
            
            return coin;
        } catch (error) {
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
            
            // Get markets data
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets`);
            const markets = marketsResponse.data;
            
            // Find markets with matching symbols
            const matchingMarkets = markets.filter(m => formattedSymbols.includes(m.symbol));
            
            if (matchingMarkets.length === 0) {
                return []; // No matching markets found
            }
            
            // Get ticker data
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            
            // Combine market and ticker data
            return matchingMarkets.map(market => {
                const ticker = tickers.find(t => t.market === market.market) || {};
                return {
                    symbol: market.symbol,
                    price: ticker.last_price || '0',
                    priceChangePercent: ticker.change_24_hour || '0.00'
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
            
            // Get markets data
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets`);
            const markets = marketsResponse.data;
            
            // Get ticker data
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            
            // Filter and format default coins
            const defaultCoins = [];
            
            for (const symbol of defaultSymbols) {
                const market = markets.find(m => m.symbol === symbol);
                if (!market) continue;
                
                const ticker = tickers.find(t => t.market === market.market);
                if (!ticker) continue;
                
                const baseCoin = symbol.replace('USDT', '');
                
                defaultCoins.push({
                    symbol,
                    name: getFullNameFromSymbol(baseCoin),
                    price: ticker.last_price,
                    priceChangePercent: ticker.change_24_hour
                });
            }
            
            return defaultCoins;
        } catch (error) {
            console.error('Failed to fetch default coins:', error.message);
            throw new Error(`Failed to fetch default coins: ${error.message}`);
        }
    },
    
    // Search for coins by name or symbol
    searchCoins: async (query) => {
        try {
            // Get markets data
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets`);
            const markets = marketsResponse.data;
            
            // Filter for USDT pairs only and match against query
            const usdtPairs = markets.filter(market => 
                market.symbol.endsWith('USDT') && 
                market.symbol.toLowerCase().includes(query.toLowerCase())
            );
            
            // If no results found, search by coin name in our mapping
            if (usdtPairs.length === 0) {
                const matchingCoins = Object.entries(getKnownCoins()).filter(([symbol, name]) => 
                    name.toLowerCase().includes(query.toLowerCase())
                );
                
                if (matchingCoins.length > 0) {
                    // Use our matching coins to find the related markets
                    const symbolMatches = [];
                    
                    for (const [symbol, name] of matchingCoins) {
                        const marketSymbol = symbol + 'USDT';
                        const market = markets.find(m => m.symbol === marketSymbol);
                        if (market) {
                            symbolMatches.push(market);
                        }
                    }
                    
                    if (symbolMatches.length > 0) {
                        // Limit to top 10 results
                        const limitedResults = symbolMatches.slice(0, 10);
                        
                        // Get ticker data
                        const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
                        const tickers = tickerResponse.data;
                        
                        // Format results with names
                        return limitedResults.map(market => {
                            const ticker = tickers.find(t => t.market === market.market) || {};
                            const baseCoin = market.symbol.replace('USDT', '');
                            
                            return {
                                symbol: market.symbol,
                                name: getFullNameFromSymbol(baseCoin),
                                price: ticker.last_price || '0'
                            };
                        });
                    }
                }
                
                // If still no results, return empty array
                return [];
            }
            
            // Limit to top 10 results
            const limitedResults = usdtPairs.slice(0, 10);
            
            // Get ticker data
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            
            // Format results with names
            return limitedResults.map(market => {
                const ticker = tickers.find(t => t.market === market.market) || {};
                const baseCoin = market.symbol.replace('USDT', '');
                
                return {
                    symbol: market.symbol,
                    name: getFullNameFromSymbol(baseCoin),
                    price: ticker.last_price || '0'
                };
            });
        } catch (error) {
            console.error('Failed to search coins:', error.message);
            throw new Error(`Failed to search coins: ${error.message}`);
        }
    }
};

// Helper function to get known coins mapping
function getKnownCoins() {
    return {
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
}

// Helper function to get full name from symbol
function getFullNameFromSymbol(symbol) {
    const coinNames = getKnownCoins();
    return coinNames[symbol] || symbol;
}

module.exports = coindcxService;