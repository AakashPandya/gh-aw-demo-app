import express, { type ErrorRequestHandler } from 'express';
import { findUser } from './users.js';
import { createOrderStore, isOrderInput } from './orders.js';

export function createApp() {
  const app = express();
  const orders = createOrderStore();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/users/:id', (req, res) => {
    const user = findUser(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ id: user.id, name: user.name });
  });

  app.post('/api/orders', (req, res) => {
    if (!isOrderInput(req.body)) {
      res.status(400).json({ error: 'product must be nonblank and quantity must be a positive integer' });
      return;
    }
    const order = orders.create(req.body);
    res.status(201).location(`/api/orders/${order.id}`).json(order);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json(order);
  });

  const handleError: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? error.status : undefined;
    if (status === 400 || status === 413) {
      res.status(status).json({ error: status === 413 ? 'Request body too large' : 'Invalid JSON body' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  };
  app.use(handleError);
  return app;
}
