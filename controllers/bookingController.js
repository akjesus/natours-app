const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

exports.getCheckout = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  //   2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${
                tour.imageCover
              }`,
            ],
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      name: `${tour.name} Tour`,
      description: tour.summary,
      images: `${req.protocol}://${req.get('host')}/img/tours/${
        tour.imageCover
      }`,
    },
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  });
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});
const createCheckoutBooking = async (session) => {
  const tour = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });
  const price = session.amount_total / 100;
  const booking = await Booking.create({ tour, user, price });
  const url = '/my-tours';
  await new Email(user, url).sendBooking();
};
// exports.createCheckoutBooking = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;
//   if (!tour && !user && !price) return next();
//   const booking = await Booking.create({ tour, user, price });
//   const url = `${req.protocol}://${req.get('host')}/my-tours`;
//   const bookedUser = await User.findById(user);
//   await new Email(bookedUser, url).sendBooking();
//   res.redirect(req.originalUrl.split('?')[0]);
// });
exports.webhooksCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    createCheckoutBooking(event.data.object);
    res.status(200).json({ received: true });
  }
};
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.findOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
