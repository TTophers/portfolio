import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'Method not allowed' });
  }

  const { user_id, email, price_id } = req.body;

  if (!user_id || !email || !price_id) {
    return res.status(400).send({ error: 'Missing required fields' });
  }

  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // or 'payment' if one-time
      line_items: [{ price: price_id, quantity: 1 }],
      customer_email: email,
      client_reference_id: auth_id,
      success_url: `https://www.tophersdesign.com/C-Payments.html`,
      cancel_url: `https://www.tophersdesign.com/C-Payments.html`
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}