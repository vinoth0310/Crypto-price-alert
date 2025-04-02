// PriceAlert component to display individual price alerts
const PriceAlert = ({ alert, coinData, onToggle, onRemove }) => {
    const formatPrice = (price) => {
        price = parseFloat(price);
        if (price < 0.001) return price.toFixed(8);
        if (price < 0.1) return price.toFixed(6);
        if (price < 100) return price.toFixed(4);
        return price.toFixed(2);
    };
    
    const getStatusIndicator = () => {
        // If we don't have current price data, show neutral status
        if (!coinData) {
            return { 
                color: 'gray',
                message: 'Unknown status' 
            };
        }
        
        const currentPrice = parseFloat(coinData.price);
        const targetPrice = parseFloat(alert.targetPrice);
        
        if (alert.condition === 'above') {
            if (currentPrice >= targetPrice) {
                return { 
                    color: 'green',
                    message: 'Target reached!' 
                };
            } else {
                const percentAway = ((targetPrice - currentPrice) / currentPrice * 100).toFixed(1);
                return { 
                    color: 'blue',
                    message: `${percentAway}% away` 
                };
            }
        } else { // below
            if (currentPrice <= targetPrice) {
                return { 
                    color: 'green',
                    message: 'Target reached!' 
                };
            } else {
                const percentAway = ((currentPrice - targetPrice) / currentPrice * 100).toFixed(1);
                return { 
                    color: 'blue',
                    message: `${percentAway}% away` 
                };
            }
        }
    };
    
    const status = getStatusIndicator();
    const statusColorClass = `bg-${status.color}-100 text-${status.color}-800`;
    
    return (
        <div className={`bg-white rounded-lg shadow p-4 ${!alert.active ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <div className="font-medium">{alert.coinName || alert.symbol}</div>
                    <div className="text-sm text-gray-500">{alert.symbol}</div>
                </div>
                <div className="flex items-center">
                    <label className="inline-flex items-center cursor-pointer mr-3">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={alert.active}
                            onChange={() => onToggle(alert.id)}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                </div>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="text-sm">
                    <span className="text-gray-500">Condition: </span>
                    <span className="font-medium capitalize">{alert.condition}</span>
                </div>
                <div className="text-sm">
                    <span className="text-gray-500">Target: </span>
                    <span className="font-medium">${formatPrice(alert.targetPrice)}</span>
                </div>
            </div>
            
            <div className="mt-2 text-sm">
                <span className="text-gray-500">Current: </span>
                <span className="font-medium">
                    {coinData ? `$${formatPrice(coinData.price)}` : 'Loading...'}
                </span>
            </div>
            
            <div className="flex justify-between items-center mt-3">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColorClass}`}>
                    {status.message}
                </span>
                
                <button 
                    className="text-red-500 text-sm hover:text-red-700"
                    onClick={() => onRemove(alert.id)}
                >
                    Delete
                </button>
            </div>
        </div>
    );
};
