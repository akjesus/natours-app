const express = require('express');

const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/signup', authController.signup);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);
router.get('/me', usersController.getMe, usersController.getUser);
router.patch('/updatePassword', authController.updatePassword);
router.patch(
  '/updateMe',
  usersController.uploadUserPhoto,
  usersController.resizePhoto,
  usersController.updateMe
);
router.delete('/deactivateMe', usersController.deactivateMe);

router.use(authController.restrictTo('admin'));
router.route('/').get(usersController.getAllUsers);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
