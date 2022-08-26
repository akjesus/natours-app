const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception! Application is shutting down!');
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => console.log('Database Connected Successfully!'));
const port = process.env.PORT || 3000;
const server = app.listen(port, '127.0.0.1', () => {
  console.log(
    `Natours App is running at port: ${port}, in ${process.env.NODE_ENV} mode`
  );
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Error! Application is shutting down!');
  server.close(() => {
    process.exit(1);
  });
});
