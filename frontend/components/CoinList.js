// CoinList component to display the list of tracked coins
const CoinList = ({ coins, onRemove, onAddAlert }) => {
    const [selectedCoin, setSelectedCoin] = React.useState(null);
    
    // Format price with appropriate decimals
    const formatPrice = (price) => {
        price = parseFloat(price);
        if (price < 0.001) return price.toFixed(8);
        if (price < 0.1) return price.toFixed(6);
        if (price < 100) return price.toFixed(4);
        return price.toFixed(2);
    };
    
    // Generate CSS classes for price change
    const getPriceChangeClass = (percentChange) => {
        const change = parseFloat(percentChange);
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
    };
    
    // Open alert creation modal
    const handleAlertClick = (coin) => {
        setSelectedCoin(coin);
    };
    
    // Close alert creation modal
    const closeModal = () => {
        setSelectedCoin(null);
    };
    
    // Handle creating a new alert
    const handleCreateAlert = (e) => {
        e.preventDefault();
        const form = e.target;
        const condition = form.condition.value;
        const targetPrice = form.targetPrice.value;
        
        if (!targetPrice || isNaN(parseFloat(targetPrice))) {
            return; // Form validation would handle this
        }
        
        onAddAlert({
            symbol: selectedCoin.symbol,
            coinName: selectedCoin.name,
            condition,
            targetPrice
        });
        
        closeModal();
    };
    
    return (
        <div>
            {coins.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No coins added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Use the form below to add coins</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {coins.map((coin) => (
                            <li key={coin.symbol} className="p-4 hover:bg-gray-50 transition">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="text-lg font-medium text-gray-900">{coin.name}</div>
                                        <div className="text-sm text-gray-500 ml-2">{coin.symbol}</div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="text-right">
                                            <div className="text-lg font-semibold">
                                                ${formatPrice(coin.price)}
                                            </div>
                                            <div className={`text-sm ${getPriceChangeClass(coin.priceChangePercent)}`}>
                                                {parseFloat(coin.priceChangePercent).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-3 space-x-2">
                                    <button 
                                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition"
                                        onClick={() => handleAlertClick(coin)}
                                    >
                                        Set Alert
                                    </button>
                                    <button 
                                        className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm hover:bg-red-200 transition"
                                        onClick={() => onRemove(coin.symbol)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Alert Creation Modal */}
            {selectedCoin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Set Price Alert for {selectedCoin.name}</h3>
                        <p className="text-gray-600 mb-2">Current price: ${formatPrice(selectedCoin.price)}</p>
                        
                        <form onSubmit={handleCreateAlert}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Alert me when price is:
                                </label>
                                <select 
                                    name="condition"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue="above"
                                >
                                    <option value="above">Above</option>
                                    <option value="below">Below</option>
                                </select>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Target Price (USD)
                                </label>
                                <input 
                                    name="targetPrice"
                                    type="number" 
                                    step="0.000001"
                                    min="0"
                                    defaultValue={selectedCoin.price}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button 
                                    type="button"
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Alert
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
