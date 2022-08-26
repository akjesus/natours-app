const Employee = require('../models/employeeModel');
const factory = require('./handlerFactory');

exports.createEmployee = factory.createOne(Employee);
exports.getEmployee = factory.findOne(Employee);
exports.getAllEmployees = factory.getAll(Employee);
exports.updateEmployee = factory.updateOne(Employee);
exports.deleteEmployee = factory.deleteOne(Employee);
