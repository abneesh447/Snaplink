import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import linksRouter from './routes/links.js';
import redirectRouter from './routes/redirect.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.use('/', redirectRouter);

app.use('/api/links', linksRouter);

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.status === 401 || err.message === 'Unauthenticated') {
    return res.status(401).json({ error: 'Authentication token is invalid or missing.' });
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(` Server running on port ${port}`);
    console.log(` API endpoints ready at http://localhost:${port}/api`);
  });
}

export default app;
