var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Mailjet",
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY
  }
});

module.exports.send_validation = function(to, subject, text, html) {
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Gravacoin Admin ✔ <jorge.dimitri@gmail.com>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: html // html body
  }

  if (config.send_emails) {
    smtpTransport.sendMail(mailOptions, function(error, response){
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + response.message);
      }
    });
  }
}
