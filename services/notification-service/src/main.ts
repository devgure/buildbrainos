import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }));

app.post('/send-sms', (req, res) => {
  const { to, message } = req.body || {};
  // placeholder: integrate Twilio here
  if (!to || !message) return res.status(400).json({ error: 'to and message required' });
  console.log(`Sending SMS to ${to}: ${message}`);
  res.json({ status: 'queued' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 4007;
  app.listen(PORT, () => console.log(`Notification service running on ${PORT}`));
}

export default app;
