// Simple script to test process via direct event object (bypasses signature)
const axios = require('axios');
const stripeSecret = process.env.STRIPE_KEY || 'sk_test_replace';

async function mock() {
  // Example minimal event structure for payment_intent.succeeded
  const evt = {
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_mock_123', amount: 1000, currency: 'usd', status: 'succeeded' } },
    account: null
  };
  // POST to local webhook endpoint (no signature)
  try {
    const url = process.env.WEBHOOK_URL || 'http://localhost:5001/webhook-test';
    const r = await axios.post(url, evt);
    console.log('response', r.data);
  } catch (e) {
    console.error('error posting mock event', e.message);
  }
}

if (require.main === module) mock();
