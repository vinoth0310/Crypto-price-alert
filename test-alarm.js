// Simple script to test the alarm functionality
const axios = require('axios');

// Function to create a test alert that will trigger immediately
async function createTestAlert() {
  try {
    // 1. Get current price of Bitcoin
    const priceResponse = await axios.get('http://localhost:8000/api/coins/price/BTCUSDT');
    const currentPrice = parseFloat(priceResponse.data.price);
    console.log(`Current Bitcoin price: $${currentPrice}`);
    
    // 2. Create an alert that will trigger immediately (price is already met)
    // If current price is 85000, we'll set an alert for 86000 with condition "below"
    const alertData = {
      symbol: 'BTCUSDT',
      coinName: 'Bitcoin',
      targetPrice: currentPrice + 1, // Slightly above current price
      condition: 'below' // Will trigger since current price is below target
    };
    
    console.log(`Creating test alert: ${alertData.coinName} ${alertData.condition} $${alertData.targetPrice}`);
    
    // 3. Create the alert via API
    const alertResponse = await axios.post('http://localhost:8000/api/alerts', alertData);
    console.log('Alert created successfully:', alertResponse.data);
    
    console.log('\nThe alarm should trigger within 30 seconds. Check the browser window!');
    console.log('You can stop the alarm by clicking the "Stop Alarm" button in the notification.');
    
  } catch (error) {
    console.error('Error creating test alert:', error.message);
    if (error.response) {
      console.error('API response:', error.response.data);
    }
  }
}

// Run the test
createTestAlert();