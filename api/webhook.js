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
    console.log('SESSION DATA:', session);

    let { data: userData } = await supabase
      .from('users')
      .select('payments, email')
      .eq('auth_id', session.client_reference_id)
      .single();

    // 🔥 fallback if auth_id match fails
    if (!userData && session.customer_details?.email) {
      const { data: fallbackUser } = await supabase
        .from('users')
        .select('payments, email')
        .eq('email', session.customer_details.email)
        .single();

      userData = fallbackUser;

      if (fallbackUser && session.customer) {
        await supabase
          .from('users')
          .update({ stripe_customer_id: session.customer })
          .eq('email', session.customer_details.email);
      }
    }

    const existingPayments = Array.isArray(userData?.payments) ? userData.payments : [];

    const newPayment = {
      amount: session.amount_total / 100, // 0 is valid
      status: session.amount_total === 0 ? 'free' : 'paid',
      created_at: new Date().toISOString(),
      receipt_url: session.payment_intent
        ? `https://dashboard.stripe.com/payments/${session.payment_intent}`
        : session.invoice
        ? `https://dashboard.stripe.com/invoices/${session.invoice}`
        : '',
      invoice_id: session.invoice || session.id,
    };

    const updatedPayments = existingPayments.some(p => p.invoice_id === newPayment.invoice_id)
      ? existingPayments
      : [...existingPayments, newPayment];

    if (session.customer) {
      await supabase
        .from('users')
        .update({
          stripe_customer_id: session.customer,
          payments: updatedPayments
        })
        .eq('auth_id', session.client_reference_id);
    } else {
      console.error('NO CUSTOMER ID ON SESSION');
    }

    console.log('Checkout payment recorded for user:', session.client_reference_id);
  }

  if (
    event.type === 'invoice.payment_succeeded' ||
    event.type === 'invoice_payment.paid'
  ) {
    let invoiceObj;
    let customerId;
    let amount;

    // Handle NEW event: invoice_payment.paid
    if (event.type === 'invoice_payment.paid') {
      const payment = event.data.object;

      // Fetch full invoice to get customer ID
      const fullInvoice = await stripe.invoices.retrieve(payment.invoice);

      customerId = fullInvoice.customer;
      amount = payment.amount_paid / 100;
      invoiceObj = fullInvoice;
    }

    // Handle STANDARD event: invoice.payment_succeeded
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      customerId = invoice.customer;
      amount = invoice.amount_paid / 100;
      invoiceObj = invoice;
    }

    let { data: userData } = await supabase
      .from('users')
      .select('payments, email')
      .eq('stripe_customer_id', customerId)
      .single();

    // 🔥 fallback: match by email if customer_id not found
    if (!userData) {
      const customer = await stripe.customers.retrieve(customerId);

      const { data: fallbackUser } = await supabase
        .from('users')
        .select('payments, email')
        .eq('email', customer.email)
        .single();

      userData = fallbackUser;

      if (fallbackUser) {
        // also fix missing stripe_customer_id going forward
        await supabase
          .from('users')
          .update({ stripe_customer_id: customerId })
          .eq('email', customer.email);
      }
    }

    const existingPayments = Array.isArray(userData?.payments) ? userData.payments : [];

    const newPayment = {
      amount: amount, // can be 0
      status: amount === 0 ? 'free' : 'paid',
      created_at: new Date().toISOString(),
      receipt_url: invoiceObj.hosted_invoice_url || '',
      invoice_id: invoiceObj.id,
    };

    const updatedPayments = existingPayments.some(p => p.invoice_id === newPayment.invoice_id)
      ? existingPayments
      : [...existingPayments, newPayment];

    await supabase
      .from('users')
      .update({ payments: updatedPayments })
      .eq('stripe_customer_id', customerId);

    console.log('Invoice payment recorded for customer:', customerId);
  }

  res.status(200).json({ received: true });
}