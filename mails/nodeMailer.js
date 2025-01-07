const nodemailer = require('nodemailer')

const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    // port: 587,
    secure: false,
    auth: {
      user: process.env.STMP_USER,
      pass: process.env.STMP_PASS
    }
})

module.exports = transport