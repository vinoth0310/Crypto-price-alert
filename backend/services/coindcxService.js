const axios = require('axios');

const COINDCX_API_BASE = 'https://api.coindcx.com';

// Service for interacting with CoinDCX API
const coindcxService = {
    // Get detailed information for a specific coin
    getCoinInfo: async (symbol) => {
        try {
            console.log(`Getting detailed info for symbol: ${symbol}`);
            
            // Ensure symbol is in uppercase and has USDT suffix if not present
            let formattedSymbol = symbol.toUpperCase();
            if (!formattedSymbol.endsWith('USDT')) {
                formattedSymbol += 'USDT';
            }
            console.log(`Formatted symbol: ${formattedSymbol}`);
            
            // Get markets details for coin name
            console.log('Fetching markets details from CoinDCX API...');
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets_details`);
            const markets = marketsResponse.data;
            console.log(`Received ${markets.length} markets details from CoinDCX API`);
            
            // Find market with matching symbol in coindcx_name
            const market = markets.find(m => m.coindcx_name === formattedSymbol);
            
            if (!market) {
                console.log(`Market not found for symbol: ${formattedSymbol}`);
                return null; // Market not found
            }
            console.log(`Found market: ${market.coindcx_name}`);
            
            // Get ticker data directly (symbol matches market name in ticker)
            console.log('Fetching ticker data from CoinDCX API...');
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            console.log(`Received ${tickers.length} tickers from CoinDCX API`);
            
            // Find ticker with matching market name
            const ticker = tickers.find(t => t.market === formattedSymbol);
            
            if (!ticker) {
                console.log(`Ticker not found for market: ${formattedSymbol}`);
                return null; // Ticker not found
            }
            console.log(`Found ticker with price: ${ticker.last_price}`);
            
            // Create formatted coin object with full details from market
            const coin = {
                symbol: formattedSymbol,
                name: market.target_currency_name,
                price: ticker.last_price,
                priceChangePercent: ticker.change_24_hour,
                volume: ticker.volume,
                high24h: ticker.high,
                low24h: ticker.low,
                lastUpdated: new Date().toISOString()
            };
            
            console.log(`Returning detailed coin info for ${formattedSymbol}`);
            return coin;
        } catch (error) {
            console.error(`Failed to fetch coin info for ${symbol}:`, error.message);
            // Log more details about the error
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            }
            throw new Error(`Failed to fetch coin info: ${error.message}`);
        }
    },
    
    // Get prices for multiple coins at once
    getPrices: async (symbols) => {
        try {
            console.log(`Getting prices for symbols: ${symbols.join(', ')}`);
            
            // Ensure all symbols have USDT suffix
            const formattedSymbols = symbols.map(symbol => {
                let formatted = symbol.toUpperCase();
                if (!formatted.endsWith('USDT')) {
                    formatted += 'USDT';
                }
                return formatted;
            });
            console.log(`Formatted symbols: ${formattedSymbols.join(', ')}`);
            
            // Get ticker data directly (market names match the symbols)
            console.log('Fetching ticker data from CoinDCX API...');
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            console.log(`Received ${tickers.length} tickers from CoinDCX API`);
            
            // Filter tickers by market name matching our symbols
            const matchingTickers = tickers.filter(ticker => 
                formattedSymbols.includes(ticker.market)
            );
            console.log(`Found ${matchingTickers.length} matching tickers`);
            
            if (matchingTickers.length === 0) {
                console.log('No matching tickers found, returning empty array');
                return []; // No matching tickers found
            }
            
            // Format the results
            const results = matchingTickers.map(ticker => {
                const baseCoin = ticker.market.replace('USDT', '');
                console.log(`Processing ticker for ${ticker.market} with price ${ticker.last_price}`);
                
                return {
                    symbol: ticker.market,
                    price: ticker.last_price || '0',
                    priceChangePercent: ticker.change_24_hour || '0.00'
                };
            });
            
            console.log(`Returning prices for ${results.length} coins`);
            return results;
        } catch (error) {
            console.error('Failed to fetch prices:', error.message);
            // Log more details about the error
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            }
            throw new Error(`Failed to fetch prices: ${error.message}`);
        }
    },
    
    // Get a set of default popular coins
    getDefaultCoins: async () => {
        try {
            const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
            console.log('Getting default coins for symbols:', defaultSymbols);
            
            // Get ticker data directly (we don't need markets data since market names match the symbols)
            console.log('Fetching ticker data from CoinDCX API...');
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            console.log(`Received ${tickers.length} tickers from CoinDCX API`);
            
            // Filter and format default coins
            const defaultCoins = [];
            
            for (const symbol of defaultSymbols) {
                console.log(`Processing symbol: ${symbol}`);
                // Match ticker directly by market name
                const ticker = tickers.find(t => t.market === symbol);
                if (!ticker) {
                    console.log(`Ticker not found for symbol: ${symbol}`);
                    continue;
                }
                
                console.log(`Found ticker for ${symbol}: ${JSON.stringify(ticker)}`);
                const baseCoin = symbol.replace('USDT', '');
                
                defaultCoins.push({
                    symbol,
                    name: getFullNameFromSymbol(baseCoin),
                    price: ticker.last_price,
                    priceChangePercent: ticker.change_24_hour
                });
                console.log(`Added ${symbol} to default coins`);
            }
            
            console.log(`Returning ${defaultCoins.length} default coins`);
            return defaultCoins;
        } catch (error) {
            console.error('Failed to fetch default coins:', error.message);
            // Log more details about the error
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            }
            throw new Error(`Failed to fetch default coins: ${error.message}`);
        }
    },
    
    // Search for coins by name or symbol
    searchCoins: async (query) => {
        try {
            console.log(`Searching for coins with query: ${query}`);
            
            // Get markets details data for proper filtering
            console.log('Fetching markets details from CoinDCX API...');
            const marketsResponse = await axios.get(`${COINDCX_API_BASE}/exchange/v1/markets_details`);
            const markets = marketsResponse.data;
            console.log(`Received ${markets.length} markets details from CoinDCX API`);
            
            // Filter for USDT pairs only and match against query
            const usdtPairs = markets.filter(market => 
                market.base_currency_short_name === "USDT" && 
                (
                    market.target_currency_short_name.toLowerCase().includes(query.toLowerCase()) ||
                    market.target_currency_name.toLowerCase().includes(query.toLowerCase())
                )
            );
            console.log(`Found ${usdtPairs.length} matching USDT pairs for query: ${query}`);
            
            // If no results found, search by coin name in our mapping
            if (usdtPairs.length === 0) {
                console.log(`No direct matches found, searching in known coins mapping`);
                const matchingCoins = Object.entries(getKnownCoins()).filter(([symbol, name]) => 
                    name.toLowerCase().includes(query.toLowerCase())
                );
                console.log(`Found ${matchingCoins.length} matching coins in our mapping`);
                
                if (matchingCoins.length > 0) {
                    // Use our matching coins to find the related markets
                    const symbolMatches = [];
                    
                    for (const [symbol, name] of matchingCoins) {
                        const marketSymbol = symbol + 'USDT';
                        console.log(`Looking for market with symbol: ${marketSymbol}`);
                        
                        // Find in markets by the symbol format in coindcx_name
                        const market = markets.find(m => m.coindcx_name === marketSymbol);
                        if (market) {
                            symbolMatches.push(market);
                            console.log(`Found market for ${marketSymbol}`);
                        }
                    }
                    
                    if (symbolMatches.length > 0) {
                        console.log(`Found ${symbolMatches.length} markets for the matching coins`);
                        // Limit to top 10 results
                        const limitedResults = symbolMatches.slice(0, 10);
                        
                        // Get ticker data
                        const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
                        const tickers = tickerResponse.data;
                        console.log(`Received ${tickers.length} tickers from CoinDCX API`);
                        
                        // Format results with names
                        const results = limitedResults.map(market => {
                            // Match ticker by market name which should match coindcx_name
                            const ticker = tickers.find(t => t.market === market.coindcx_name) || {};
                            console.log(`Found ticker for ${market.coindcx_name}: ${ticker.last_price || 'N/A'}`);
                            
                            return {
                                symbol: market.coindcx_name,
                                name: market.target_currency_name,
                                price: ticker.last_price || '0'
                            };
                        });
                        
                        console.log(`Returning ${results.length} search results`);
                        return results;
                    }
                }
                
                // If still no results, return empty array
                console.log(`No matching results found, returning empty array`);
                return [];
            }
            
            // Limit to top 10 results
            const limitedResults = usdtPairs.slice(0, 10);
            
            // Get ticker data
            console.log('Fetching ticker data from CoinDCX API...');
            const tickerResponse = await axios.get(`${COINDCX_API_BASE}/exchange/ticker`);
            const tickers = tickerResponse.data;
            console.log(`Received ${tickers.length} tickers from CoinDCX API`);
            
            // Format results with names
            const results = limitedResults.map(market => {
                // Match ticker by market name which should match coindcx_name
                const ticker = tickers.find(t => t.market === market.coindcx_name) || {};
                console.log(`Found ticker for ${market.coindcx_name}: ${ticker.last_price || 'N/A'}`);
                
                return {
                    symbol: market.coindcx_name,
                    name: market.target_currency_name,
                    price: ticker.last_price || '0'
                };
            });
            
            console.log(`Returning ${results.length} search results`);
            return results;
        } catch (error) {
            console.error('Failed to search coins:', error.message);
            // Log more details about the error
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('Error request:', error.request);
            }
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