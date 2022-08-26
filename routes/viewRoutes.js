const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

//ROUTES
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get(
  '/bookings',
  authController.protect,
  bookingController.getAllBookings
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', viewsController.login);
router.get('/signup', viewsController.signup);
router.post('/signup', authController.signup);
router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);

module.exports = router;
