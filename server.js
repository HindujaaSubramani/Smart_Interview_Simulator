// server.js (using ES modules)
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Use version 2 — install with: npm install node-fetch@2
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ CORS middleware setup — allow only your frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // change to your frontend origin if deployed
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ Load D-ID API key from .env
const DID_API_KEY = process.env.DID_API_KEY;

// Root route
app.get('/', (req, res) => {
  res.send('Smart Interview Simulator backend is running.');
});

// ✅ POST /api/talks - Proxy to D-ID API
app.post('/api/talks', async (req, res) => {
  try {
    console.log("Sending to D-ID:", JSON.stringify(req.body, null, 2));

    const response = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DID_API_KEY}`, // ✅ IMPORTANT: Use Bearer
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from D-ID:", errorText);
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});

// ✅ GET /api/talks/:id - Poll status of video generation
app.get('/api/talks/:id', async (req, res) => {
  try {
    const talkId = req.params.id;
    const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: {
        'Authorization': `Bearer ${DID_API_KEY}` // ✅ Use Bearer format here too
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(`GET /api/talks/${req.params.id} error:`, err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
});

// Start server
app.listen(4000, () => {
  console.log('Proxy server running on http://localhost:4000');
});
