import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());


const stripe = new Stripe(process.env.testkey);

// Temporary health check endpoint (verify backend is running)
app.get('/health', (req, res) => {
  res.json({ status: 'Server is alive!' });
});

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { user_id, email, price_id } = req.body;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: price_id, // <-- now dynamic
          quantity: 1
        },
      ],
      success_url: 'http://localhost:5500/success.html',
      cancel_url: 'http://localhost:5500/C-Payments.html',
      client_reference_id: user_id
    });
    
    res.json({ url: session.url });

  } catch (err) {
    console.error("Stripe error full:", err); // <-- log full object
    res.status(500).json({ error: err.message, raw: err });
  }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import bodyParser from 'body-parser';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://YOUR_PROJECT.supabase.co', 'YOUR_SERVICE_ROLE_KEY');

app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
    const session = event.data.object;

    const newPayment = {
      amount: session.amount_total / 100,
      status: 'paid',
      created_at: new Date().toISOString(),
      receipt_url: session.payment_intent
        ? `https://dashboard.stripe.com/payments/${session.payment_intent}`
        : ''
    };

    const { data: userData } = await supabase
      .from('users')
      .select('payments')
      .eq('auth_id', session.client_reference_id)
      .single();

    const updatedPayments = [...(userData?.payments || []), newPayment];

    await supabase
      .from('users')
      .update({ payments: updatedPayments })
      .eq('auth_id', session.client_reference_id);

    console.log('Payment recorded for user:', session.client_reference_id);
  }

  res.json({ received: true });
});
