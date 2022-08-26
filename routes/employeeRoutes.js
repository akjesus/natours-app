const express = require('express');
const employeesController = require('../controllers/employeesController');

const router = express.Router();
router
  .route('/')
  .get(employeesController.getAllEmployees)
  .post(employeesController.createEmployee);
router
  .route('/:id')
  .get(employeesController.getEmployee)
  .patch(employeesController.updateEmployee)
  .delete(employeesController.deleteEmployee);

module.exports = router;
