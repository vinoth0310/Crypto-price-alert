const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const BACKEND_URL = 'http://localhost:8000';

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Proxy API requests to the backend server
app.use('/api', async (req, res) => {
  try {
    // Add /api prefix to the URL path for the backend
    const url = `${BACKEND_URL}/api${req.url}`;
    console.log(`Proxying request to: ${url}`);
    
    const method = req.method.toLowerCase();
    let response;
    
    if (method === 'get') {
      response = await axios.get(url);
    } else if (method === 'post') {
      response = await axios.post(url, req.body);
    } else if (method === 'put') {
      response = await axios.put(url, req.body);
    } else if (method === 'delete') {
      response = await axios.delete(url);
    }
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    
    // Return appropriate error response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      res.status(503).json({ error: 'Backend server unavailable' });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Always send index.html for any request that's not an API call
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});