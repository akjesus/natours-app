const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tours = require('../../models/tourModel');
const Users = require('../../models/userModel');
const Reviews = require('../../models/reviewModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB Connected Successfully!');
  });

//Read Data from file
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//Delete original data in database
const deleteData = async () => {
  try {
    await Tours.deleteMany();
    await Users.deleteMany();
    await Reviews.deleteMany();
    console.log('Data deleted successfully');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Write data to database
const importData = async () => {
  try {
    await Tours.create(tour);
    await Users.create(user, { validateBeforeSave: false });
    await Reviews.create(review);
    console.log('Data written successfully');
  } catch (err) {
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
