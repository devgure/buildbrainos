import express from 'express';
import bodyParser from 'body-parser';
import router from './controllers/marketplace.controller';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'marketplace-service' }));
app.use('/market', router);

if (require.main === module) {
  const PORT = process.env.PORT || 4006;
  app.listen(PORT, () => console.log(`Marketplace service running on ${PORT}`));
}

export default app;
