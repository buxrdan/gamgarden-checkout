const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const { price, name } = req.query;

    if (!price || !name) {
      return res.status(400).json({ error: 'Missing price or product name' });
    }

    const amount = parseInt(price);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name: name },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://gamgarden.shop/thank-you',
      cancel_url: 'https://gamgarden.shop',
      payment_intent_data: {
        application_fee_amount: Math.round(amount * 0.01),
        transfer_data: {
          destination: 'acct_1T4PAyLLsG87wzIA',
        },
      },
    });

    res.redirect(303, session.url);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
