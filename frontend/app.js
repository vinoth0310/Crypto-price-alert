// Main App Component
const App = () => {
    const [coins, setCoins] = React.useState([]);
    const [alerts, setAlerts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('coins'); // tabs: coins, alerts

    // Initialize notification permission
    React.useEffect(() => {
        NotificationService.requestPermission();
    }, []);

    // Load coins and alerts from local storage
    React.useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                // Load saved coins and alerts from storage
                const savedCoins = StorageService.getCoins();
                const savedAlerts = StorageService.getAlerts();
                
                // If we have saved coins, use them and update with current prices
                if (savedCoins && savedCoins.length > 0) {
                    setCoins(savedCoins);
                    // Update prices for existing coins
                    refreshPrices(savedCoins);
                } else {
                    // If no saved coins, fetch some popular ones as default
                    const defaultCoins = await ApiService.getDefaultCoins();
                    setCoins(defaultCoins);
                    StorageService.saveCoins(defaultCoins);
                }
                
                // Set alerts
                if (savedAlerts) {
                    setAlerts(savedAlerts);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to load initial data:', err);
                setError('Failed to load coin data. Please check your connection.');
                setLoading(false);
            }
        };

        loadData();
        
        // Set up periodic price updates every 30 seconds
        const intervalId = setInterval(() => {
            if (coins.length > 0) {
                refreshPrices(coins);
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, []);

    // Function to refresh coin prices
    const refreshPrices = async (coinsList) => {
        try {
            const symbols = coinsList.map(coin => coin.symbol);
            const updatedPrices = await ApiService.getPrices(symbols);
            
            const updatedCoins = coinsList.map(coin => {
                const priceInfo = updatedPrices.find(p => p.symbol === coin.symbol);
                if (priceInfo) {
                    // Check if we need to trigger any alerts
                    checkAlerts(coin.symbol, parseFloat(priceInfo.price));
                    
                    return {
                        ...coin,
                        price: priceInfo.price,
                        priceChangePercent: priceInfo.priceChangePercent || coin.priceChangePercent
                    };
                }
                return coin;
            });
            
            setCoins(updatedCoins);
            StorageService.saveCoins(updatedCoins);
        } catch (err) {
            console.error('Failed to refresh prices:', err);
            setError('Failed to update prices. Please check your connection.');
        }
    };

    // Function to check alerts against current prices
    const checkAlerts = (symbol, currentPrice) => {
        const coinAlerts = alerts.filter(alert => alert.symbol === symbol);
        
        coinAlerts.forEach(alert => {
            if (alert.active) {
                const targetPrice = parseFloat(alert.targetPrice);
                const coinName = coins.find(c => c.symbol === symbol)?.name || symbol;
                
                if (alert.condition === 'above' && currentPrice >= targetPrice) {
                    NotificationService.notify(
                        `${coinName} Alert!`,
                        `${coinName} is now above ${targetPrice}! Current price: ${currentPrice.toFixed(2)}`
                    );
                    toggleAlertStatus(alert.id, false);
                } else if (alert.condition === 'below' && currentPrice <= targetPrice) {
                    NotificationService.notify(
                        `${coinName} Alert!`,
                        `${coinName} is now below ${targetPrice}! Current price: ${currentPrice.toFixed(2)}`
                    );
                    toggleAlertStatus(alert.id, false);
                }
            }
        });
    };

    // Add a new coin to track
    const addCoin = async (symbol) => {
        try {
            // Check if coin already exists
            if (coins.some(c => c.symbol === symbol.toUpperCase())) {
                setError(`${symbol.toUpperCase()} is already in your list`);
                return;
            }
            
            const coinInfo = await ApiService.getCoinInfo(symbol);
            if (coinInfo) {
                const newCoins = [...coins, coinInfo];
                setCoins(newCoins);
                StorageService.saveCoins(newCoins);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to add coin:', err);
            setError(`Failed to add ${symbol}. Please check the symbol and try again.`);
            return false;
        }
    };

    // Remove a coin from tracking
    const removeCoin = (symbol) => {
        // Remove coin
        const newCoins = coins.filter(c => c.symbol !== symbol);
        setCoins(newCoins);
        StorageService.saveCoins(newCoins);
        
        // Remove all alerts for this coin
        const newAlerts = alerts.filter(a => a.symbol !== symbol);
        setAlerts(newAlerts);
        StorageService.saveAlerts(newAlerts);
    };

    // Add a new price alert
    const addAlert = (alert) => {
        const newAlert = {
            ...alert,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            active: true
        };
        
        const newAlerts = [...alerts, newAlert];
        setAlerts(newAlerts);
        StorageService.saveAlerts(newAlerts);
    };

    // Remove a price alert
    const removeAlert = (alertId) => {
        const newAlerts = alerts.filter(a => a.id !== alertId);
        setAlerts(newAlerts);
        StorageService.saveAlerts(newAlerts);
    };

    // Toggle alert active status
    const toggleAlertStatus = (alertId, status) => {
        const newAlerts = alerts.map(alert => {
            if (alert.id === alertId) {
                return { ...alert, active: status === undefined ? !alert.active : status };
            }
            return alert;
        });
        
        setAlerts(newAlerts);
        StorageService.saveAlerts(newAlerts);
    };

    // Manual refresh handler
    const handleRefresh = () => {
        if (coins.length > 0) {
            refreshPrices(coins);
        }
    };

    // Clear error message
    const clearError = () => {
        setError(null);
    };

    return (
        <div className="flex flex-col h-full">
            <header className="bg-blue-600 text-white p-4 rounded-t-lg shadow">
                <h1 className="text-2xl font-bold text-center">Crypto Price Alerts</h1>
            </header>
            
            {/* Tabs */}
            <div className="flex border-b">
                <button 
                    className={`flex-1 py-3 text-center font-medium ${activeTab === 'coins' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('coins')}
                >
                    Coins
                </button>
                <button 
                    className={`flex-1 py-3 text-center font-medium ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('alerts')}
                >
                    Alerts
                </button>
            </div>
            
            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center p-8">
                    <div className="spinner mr-2"></div>
                    <p>Loading...</p>
                </div>
            )}
            
            {/* Error display */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                    <p>{error}</p>
                    <button 
                        className="text-sm underline mt-2" 
                        onClick={clearError}
                    >
                        Dismiss
                    </button>
                </div>
            )}
            
            {/* Main content */}
            {!loading && (
                <div className="flex-1 p-4">
                    {activeTab === 'coins' && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-medium">Your Coins</h2>
                                <button 
                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
                                    onClick={handleRefresh}
                                >
                                    Refresh
                                </button>
                            </div>
                            
                            <CoinList 
                                coins={coins} 
                                onRemove={removeCoin} 
                                onAddAlert={addAlert} 
                            />
                            
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-2">Add Coin</h3>
                                <AddCoinForm onAddCoin={addCoin} />
                            </div>
                        </>
                    )}
                    
                    {activeTab === 'alerts' && (
                        <>
                            <h2 className="text-lg font-medium mb-4">Price Alerts</h2>
                            {alerts.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <p className="text-gray-500">No alerts set yet</p>
                                    <button 
                                        className="mt-2 text-blue-500 hover:underline"
                                        onClick={() => setActiveTab('coins')}
                                    >
                                        Go to Coins to set alerts
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {alerts.map(alert => (
                                        <PriceAlert 
                                            key={alert.id}
                                            alert={alert}
                                            coinData={coins.find(c => c.symbol === alert.symbol)}
                                            onToggle={toggleAlertStatus}
                                            onRemove={removeAlert}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            
            <footer className="bg-gray-100 p-3 text-center text-gray-500 text-sm border-t">
                Data provided by CoinDCX API
            </footer>
        </div>
    );
};

// Render the app
ReactDOM.createRoot(document.getElementById('app')).render(<App />);
