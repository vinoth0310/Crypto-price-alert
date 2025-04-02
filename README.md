# Crypto Price Alert

A Progressive Web App (PWA) that monitors cryptocurrency prices and alerts you when they reach your target thresholds.

## Features

- **Real-time Price Monitoring**: Connects to CoinDCX API to get the latest cryptocurrency prices
- **Custom Price Alerts**: Set alerts for when coins go above or below specific price points
- **Persistent Notifications**: Alarm continues until manually stopped
- **Installable on iOS**: Works as a native-like app when installed via Safari
- **Offline Support**: Service worker caching for improved performance

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js with Express
- **APIs**: CoinDCX for cryptocurrency data
- **PWA Features**: Service worker, manifest.json for installation

## Installation

### Web Access
Simply visit the deployed app URL in your browser.

### iOS Installation
1. Open the app URL in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name the app and tap "Add"
5. Launch from your home screen like any native app

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup
1. Clone the repository
```
git clone https://github.com/yourusername/crypto-price-alert.git
cd crypto-price-alert
```

2. Install dependencies
```
npm install
```

3. Start the servers
```
# Start backend server
cd backend
node server.js

# In a new terminal, start frontend server
cd frontend
node server.js
```

4. Access the app at `http://localhost:5000`

## Project Structure

```
├── backend/              # Backend server and API
│   ├── data/             # In-memory data store
│   ├── routes/           # API route handlers
│   ├── services/         # Business logic 
│   └── server.js         # Express server setup
├── frontend/             # Frontend web application
│   ├── components/       # UI components
│   ├── icons/            # App icons for PWA
│   ├── services/         # Frontend services
│   ├── app.js            # Main application code
│   ├── index.html        # Main HTML file
│   ├── manifest.json     # PWA manifest
│   ├── server.js         # Frontend static server
│   ├── service-worker.js # PWA service worker
│   └── styles.css        # App styling
└── test-alarm.js         # Utility to test the alarm system
```

## License

MIT