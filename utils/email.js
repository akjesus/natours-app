const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
// new Email(user, url).sendWelcome();
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Akjesus Natours Application <${process.env.SENDPULSE_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //SendGrid transporter
      return nodemailer.createTransport({
        service: 'Sendgrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // return nodemailer.createTransport({
    //   host: process.env.SENDPULSE_HOST,
    //   port: process.env.SENDPULSE_PORT,
    //   auth: {
    //     user: process.env.SENDPULSE_USER,
    //     pass: process.env.SENDPULSE_PASSWORD,
    //   },
    // });
  }

  // sends the actual email
  async send(template, subject) {
    //1. Render the pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject: this.subject,
      }
    );

    //2. Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };
    //3. create a transport and send the email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Akjesus Natours Application');
  }

  async sendBooking() {
    await this.send('booking', 'You have successfully purchased a Tour');
  }

  async sendReset() {
    await this.send(
      'passwordReset',
      'Password Reset Token: Valid for 10 Minutes'
    );
  }
};
