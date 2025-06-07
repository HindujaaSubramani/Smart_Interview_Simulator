// server.js (ES modules version)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import llmRoutes from './backend/llm/llm.js'; // ✅ LLM route using Ollama

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS — Allow only your frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Health check route
app.get('/', (req, res) => {
  res.send('🟢 Smart Interview Simulator backend is running.');
});

// Mount LLM API route
app.use('/api/llm', llmRoutes);

// Setup __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: Serve frontend static files after building frontend
// Uncomment below if you bundle frontend with backend:

// import { fileURLToPath } from 'url';
// import path from 'path';
// app.use(express.static(path.join(__dirname, 'dist')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html'));
// });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});
