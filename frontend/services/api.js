// API Service for communicating with the backend
const ApiService = {
    // Base URL for API requests
    baseUrl: '/api',
    
    // Get info for a specific coin
    getCoinInfo: async (symbol) => {
        try {
            // Ensure the symbol is in the correct format
            const formattedSymbol = symbol.toUpperCase();
            
            const response = await axios.get(`${ApiService.baseUrl}/coins/${formattedSymbol}`);
            
            if (response.status === 200) {
                return response.data;
            }
            throw new Error(`Failed to get coin info for ${symbol}`);
        } catch (error) {
            console.error(`Error fetching coin info: ${error.message}`);
            throw error;
        }
    },
    
    // Get prices for multiple coins
    getPrices: async (symbols) => {
        try {
            // Join symbols with commas for the API request
            const symbolsParam = symbols.join(',');
            
            const response = await axios.get(`${ApiService.baseUrl}/coins/prices?symbols=${symbolsParam}`);
            
            if (response.status === 200) {
                return response.data;
            }
            throw new Error('Failed to get coin prices');
        } catch (error) {
            console.error(`Error fetching prices: ${error.message}`);
            throw error;
        }
    },
    
    // Get default coins to display when app first loads
    getDefaultCoins: async () => {
        try {
            const defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'];
            const response = await axios.get(`${ApiService.baseUrl}/coins/default`);
            
            if (response.status === 200) {
                return response.data;
            }
            throw new Error('Failed to get default coins');
        } catch (error) {
            console.error(`Error fetching default coins: ${error.message}`);
            throw error;
        }
    },
    
    // Create a new price alert
    createAlert: async (alertData) => {
        try {
            const response = await axios.post(`${ApiService.baseUrl}/alerts`, alertData);
            
            if (response.status === 201) {
                return response.data;
            }
            throw new Error('Failed to create alert');
        } catch (error) {
            console.error(`Error creating alert: ${error.message}`);
            throw error;
        }
    },
    
    // Update an existing alert
    updateAlert: async (alertId, alertData) => {
        try {
            const response = await axios.put(`${ApiService.baseUrl}/alerts/${alertId}`, alertData);
            
            if (response.status === 200) {
                return response.data;
            }
            throw new Error(`Failed to update alert ${alertId}`);
        } catch (error) {
            console.error(`Error updating alert: ${error.message}`);
            throw error;
        }
    },
    
    // Delete an alert
    deleteAlert: async (alertId) => {
        try {
            const response = await axios.delete(`${ApiService.baseUrl}/alerts/${alertId}`);
            
            if (response.status === 200) {
                return true;
            }
            throw new Error(`Failed to delete alert ${alertId}`);
        } catch (error) {
            console.error(`Error deleting alert: ${error.message}`);
            throw error;
        }
    },
};
