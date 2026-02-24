const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  try {
    const { price, name } = req.query;

    if (!price || !name) {
      return res.status(400).json({ error: 'Missing price or product name' });
    }

    const amount = parseInt(price, 10);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: { name },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://gamgarden.shop/thank-you',
      cancel_url: 'https://gamgarden.shop',
    });

    return res.redirect(303, session.url);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
