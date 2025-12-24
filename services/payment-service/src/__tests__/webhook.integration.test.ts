import request from 'supertest';
import { app } from '../main';
import prisma from '../prismaClient';

jest.mock('../prismaClient', () => ({
  paymentIntentRecord: { upsert: jest.fn() },
  payoutRecord: { upsert: jest.fn() },
  stripeAccount: { upsert: jest.fn() },
}));

describe('webhook-test endpoint', () => {
  beforeEach(() => jest.clearAllMocks());

  it('accepts a payment_intent.succeeded event and persists', async () => {
    const evt = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_int_test', amount: 1200, amount_received: 1200, currency: 'usd', status: 'succeeded' } },
      account: 'acct_test'
    };

    const res = await request(app).post('/webhook-test').send(evt).set('Accept', 'application/json');
    expect(res.status).toBe(200);
    expect(prisma.paymentIntentRecord.upsert).toHaveBeenCalled();
  });
});
