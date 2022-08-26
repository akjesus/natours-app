const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true, select: false },
  about: String,
  token: String,
  country: String,
  location: String,
  lng: Number,
  lat: Number,
  dob: Date,
  gender: Number,
  userType: Number,
  userStatus: Number,
  profilePicture: String,
  coverPicture: String,
  enablefollowme: Boolean,
  sendmenotifications: Boolean,
  sendTextmessages: Boolean,
  enabletagging: Boolean,
  createdAt: Date,
  updatedAt: Date,
  livelng: Number,
  livelat: Number,
  liveLocation: String,
  creditBalance: Number,
  myCash: Number,
});
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;
