import { processStripeEvent } from '../main';
import prisma from '../prismaClient';

jest.mock('../prismaClient', () => ({
  paymentIntentRecord: { upsert: jest.fn() },
  payoutRecord: { upsert: jest.fn() },
  stripeAccount: { upsert: jest.fn() },
}));

const mockedPrisma: any = prisma as any;

describe('processStripeEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('persists payment_intent.succeeded', async () => {
    const event = {
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_1', amount: 2000, amount_received: 2000, currency: 'usd', status: 'succeeded', customer: 'cus_1' } },
      account: 'acct_123'
    };

    await processStripeEvent(event as any);

    expect(mockedPrisma.paymentIntentRecord.upsert).toHaveBeenCalledTimes(1);
    const callArg = mockedPrisma.paymentIntentRecord.upsert.mock.calls[0][0];
    expect(callArg.where.intentId).toBe('pi_test_1');
    expect(callArg.create.amount).toBe(2000);
    expect(callArg.create.accountId).toBe('acct_123');
  });

  test('persists payout.created', async () => {
    const event = {
      type: 'payout.created',
      data: { object: { id: 'po_test_1', amount: 5000, currency: 'usd', status: 'created' } },
      account: 'acct_456'
    };

    await processStripeEvent(event as any);

    expect(mockedPrisma.payoutRecord.upsert).toHaveBeenCalledTimes(1);
    const callArg = mockedPrisma.payoutRecord.upsert.mock.calls[0][0];
    expect(callArg.where.payoutId).toBe('po_test_1');
    expect(callArg.create.amount).toBe(5000);
    expect(callArg.create.accountId).toBe('acct_456');
  });

  test('persists account.updated', async () => {
    const event = {
      type: 'account.updated',
      data: { object: { id: 'acct_789', country: 'US', email: 'a@b.com', business_type: 'company', capabilities: { card_payments: 'active' } } },
    };

    await processStripeEvent(event as any);

    expect(mockedPrisma.stripeAccount.upsert).toHaveBeenCalledTimes(1);
    const callArg = mockedPrisma.stripeAccount.upsert.mock.calls[0][0];
    expect(callArg.where.accountId).toBe('acct_789');
    expect(callArg.create.email).toBe('a@b.com');
  });
});
