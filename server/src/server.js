import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linksRouter from './routes/links.js';
import redirectRouter from './routes/redirect.js';

// Initialize dotenv environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parser Middleware
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Register Core Routes
// Redirection route (needs to be registered at the root, e.g. /:code)
app.use('/', redirectRouter);

// Links Management API (protected under auth in the route file itself)
app.use('/api/links', linksRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  
  // Handled Clerk auth error
  if (err.status === 401 || err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Authentication token is invalid or missing.' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🔗 API endpoints ready at http://localhost:${port}/api`);
  });
}

export default app;
