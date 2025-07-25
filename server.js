const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// OpenAI API proxy endpoint
app.all('/api/openai/*', async (req, res) => {
  try {
    const openaiApiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return res.status(500).json({ 
        error: { message: 'OpenAI API key not configured on server' } 
      });
    }

    // Extract the path after /api/openai
    const openaiPath = req.path.replace('/api/openai', '');
    const openaiUrl = `https://api.openai.com/v1${openaiPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;

    const response = await fetch(openaiUrl, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
        ...req.headers
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: { message: 'Internal proxy server error' } 
    });
  }
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});