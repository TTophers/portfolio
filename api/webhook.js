import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
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
      .update({
        payments: updatedPayments,
        stripe_customer_id: session.customer
      })
      .eq('auth_id', session.client_reference_id);

    console.log('Checkout payment recorded for user:', session.client_reference_id);
  }

  if (
    event.type === 'invoice.payment_succeeded' ||
    event.type === 'invoice_payment.paid'
  )  {
    const invoice = event.data.object;

    const newPayment = {
      amount: invoice.amount_paid / 100,
      status: 'paid',
      created_at: new Date().toISOString(),
      receipt_url: invoice.hosted_invoice_url || ''
    };

    const { data: userData } = await supabase
      .from('users')
      .select('payments')
      .eq('stripe_customer_id', invoice.customer)
      .single();

    const updatedPayments = [...(userData?.payments || []), newPayment];

    await supabase
      .from('users')
      .update({ payments: updatedPayments })
      .eq('stripe_customer_id', invoice.customer);

    console.log('Invoice payment recorded for customer:', invoice.customer);
  }

  res.status(200).json({ received: true });
}