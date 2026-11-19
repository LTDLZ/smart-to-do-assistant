import express from 'express';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(express.json());

  // Simple health check for deployments / smoke tests.
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', routes);

  // Unknown route
  app.use((req, res) => {
    res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Central error handler (keeps JSON responses consistent).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  return app;
}
