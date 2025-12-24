import express from 'express';
import Stripe from 'stripe';
import bodyParser from 'body-parser';
import prisma from './prismaClient';

export const app = express();
app.use(bodyParser.json());

const stripe = new Stripe(process.env.STRIPE_KEY || 'sk_test_replace', {apiVersion: '2022-11-15'} as any);

app.get('/health', (req, res) => res.json({status: 'ok', service: 'payment-service'}));

app.post('/create-payment-intent', async (req, res) => {
  const {amount, currency = 'usd'} = req.body;
  try {
    const pi = await stripe.paymentIntents.create({amount, currency});
    res.json({clientSecret: pi.client_secret});
  } catch (err:any) {
    res.status(500).json({error: err.message});
  }
});

// Stripe Connect onboarding: create an Express account and return an account link
app.post('/connect/onboard', async (req, res) => {
  try {
    const account = await stripe.accounts.create({type: 'express'});
    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/connect/refresh`,
      return_url: `${origin}/connect/return`,
      type: 'account_onboarding'
    });
    res.json({url: accountLink.url, accountId: account.id});
  } catch (err:any) {
    res.status(500).json({error: err.message});
  }
});

// Webhook endpoint (uses raw body for signature verification)
// Webhook endpoint (production uses signature verification)
app.post('/webhook', express.raw({type: 'application/json'}), (req: any, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) return res.status(400).send('Webhooks not configured');
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err:any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  processStripeEvent(event).then(() => res.json({received: true})).catch(e => {
    console.error('processStripeEvent failed', e?.message || e);
    res.status(500).send('processing error');
  });
});

// Lightweight test webhook to post JSON directly (bypasses signature) for local development
app.post('/webhook-test', express.json(), (req: any, res) => {
  const event = req.body;
  processStripeEvent(event).then(() => res.json({received: true})).catch(e => {
    console.error('processStripeEvent test failed', e?.message || e);
    res.status(500).send('processing error');
  });
});

export async function processStripeEvent(event: any) {
  switch (event.type) {
    case 'account.updated':
      {
        const acc = event.data.object;
        await prisma.stripeAccount.upsert({
          where: {accountId: acc.id},
          update: {
            country: acc.country || undefined,
            email: acc.email || undefined,
            businessType: acc.business_type || undefined,
            capabilities: acc.capabilities || undefined
          },
          create: {
            accountId: acc.id,
            country: acc.country || undefined,
            email: acc.email || undefined,
            businessType: acc.business_type || undefined,
            capabilities: acc.capabilities || undefined
          }
        });
      }
      break;
    case 'payment_intent.succeeded':
      {
        const pi = event.data.object;
        await prisma.paymentIntentRecord.upsert({
          where: { intentId: pi.id },
          update: {
            amount: pi.amount_received ?? pi.amount || 0,
            currency: pi.currency || 'usd',
            status: pi.status || 'succeeded',
            customerId: pi.customer || undefined,
            accountId: event.account || undefined
          },
          create: {
            intentId: pi.id,
            amount: pi.amount_received ?? pi.amount || 0,
            currency: pi.currency || 'usd',
            status: pi.status || 'succeeded',
            customerId: pi.customer || undefined,
            accountId: event.account || undefined
          }
        });
      }
      break;
    case 'payout.created':
      {
        const p = event.data.object;
        await prisma.payoutRecord.upsert({
          where: { payoutId: p.id },
          update: {
            amount: p.amount || 0,
            currency: p.currency || 'usd',
            status: p.status || 'created',
            accountId: event.account || undefined
          },
          create: {
            payoutId: p.id,
            amount: p.amount || 0,
            currency: p.currency || 'usd',
            status: p.status || 'created',
            accountId: event.account || undefined
          }
        });
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
}
          await prisma.payoutRecord.upsert({
            where: { payoutId: p.id },
            update: {
              amount: p.amount || 0,
              currency: p.currency || 'usd',
              status: p.status || 'created',
              accountId: event.account || undefined
            },
            create: {
              payoutId: p.id,
              amount: p.amount || 0,
              currency: p.currency || 'usd',
              status: p.status || 'created',
              accountId: event.account || undefined
            }
          });
        } catch (e:any) { console.error('persist payout failed', e.message); }
      })();
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.json({received: true});
});

const PORT = process.env.PORT || 5001;

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => console.log(`Payment service running on ${PORT}`));
  } catch (e:any) {
    console.error('Failed to start payment-service', e.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });

if (require.main === module) {
  start();
}
