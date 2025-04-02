// AddCoinForm component for adding new cryptocurrency to track
const AddCoinForm = ({ onAddCoin }) => {
    const [symbol, setSymbol] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    // Popular coin suggestions
    const suggestions = [
        { symbol: 'BTCUSDT', name: 'Bitcoin' },
        { symbol: 'ETHUSDT', name: 'Ethereum' },
        { symbol: 'BNBUSDT', name: 'Binance Coin' },
        { symbol: 'ADAUSDT', name: 'Cardano' },
        { symbol: 'DOGEUSDT', name: 'Dogecoin' },
        { symbol: 'XRPUSDT', name: 'Ripple' }
    ];
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!symbol.trim()) {
            setError('Please enter a coin symbol');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            // Convert to uppercase and add USDT if not present
            let formattedSymbol = symbol.trim().toUpperCase();
            if (!formattedSymbol.endsWith('USDT')) {
                formattedSymbol += 'USDT';
            }
            
            const success = await onAddCoin(formattedSymbol);
            if (success) {
                setSymbol('');
            }
        } catch (err) {
            setError('Failed to add coin. Please check the symbol and try again.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSuggestionClick = (suggestionSymbol) => {
        setSymbol(suggestionSymbol);
    };
    
    return (
        <div className="bg-white rounded-lg shadow p-4">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                        Coin Symbol
                    </label>
                    <input
                        type="text"
                        id="symbol"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        placeholder="Enter symbol (e.g. BTC, ETH)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                        Enter the trading symbol (will be paired with USDT)
                    </p>
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
                    disabled={loading}
                >
                    {loading ? 'Adding...' : 'Add Coin'}
                </button>
            </form>
            
            <div className="mt-4">
                <p className="text-sm text-gray-700 mb-2">Popular coins:</p>
                <div className="flex flex-wrap gap-2">
                    {suggestions.map(coin => (
                        <button
                            key={coin.symbol}
                            type="button"
                            onClick={() => handleSuggestionClick(coin.symbol)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition"
                        >
                            {coin.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
