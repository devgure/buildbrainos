const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'malformed auth' });
  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));

// Targets
const authTarget = process.env.AUTH_URL || 'http://auth-service:4001';
const userTarget = process.env.USER_URL || 'http://user-service:4002';
const projectTarget = process.env.PROJECT_URL || 'http://project-service:4003';
const paymentTarget = process.env.PAYMENT_URL || 'http://payment-service:5001';
const marketplaceTarget = process.env.MARKETPLACE_URL || 'http://marketplace-service:4006';
const blueprintTarget = process.env.BLUEPRINT_URL || 'http://blueprint-agent:8001';

app.use('/api/auth', createProxyMiddleware({ target: authTarget, changeOrigin: true, pathRewrite: {'^/api/auth': ''} }));

app.use('/api/users', requireAuth, createProxyMiddleware({ target: userTarget, changeOrigin: true, pathRewrite: {'^/api/users': ''} }));
app.use('/api/projects', requireAuth, createProxyMiddleware({ target: projectTarget, changeOrigin: true, pathRewrite: {'^/api/projects': ''} }));
app.use('/api/payment', requireAuth, createProxyMiddleware({ target: paymentTarget, changeOrigin: true, pathRewrite: {'^/api/payment': ''}, onProxyReq: (proxyReq, req) => {
  if (req.user && req.user.sub) proxyReq.setHeader('x-user-id', req.user.sub);
} }));

// Marketplace - mapped to /api/market
app.use('/api/market', requireAuth, createProxyMiddleware({ target: marketplaceTarget, changeOrigin: true, pathRewrite: {'^/api/market': ''} }));

// Blueprint agent (protected)
app.use('/api/blueprint', requireAuth, createProxyMiddleware({ target: blueprintTarget, changeOrigin: true, pathRewrite: {'^/api/blueprint': ''} }));

app.listen(PORT, () => console.log(`Gateway running on ${PORT}`));
