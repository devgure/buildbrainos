import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'analytics-service' }));

app.post('/event', (req, res) => {
  const event = req.body;
  console.log('analytics event', event);
  res.json({ status: 'ok' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 4008;
  app.listen(PORT, () => console.log(`Analytics service running on ${PORT}`));
}

export default app;
