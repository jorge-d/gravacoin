var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
  host: "in.mailjet.com",
  port: 587, // port for secure SMTP
  auth: {
    user: "84f24ca90b7a300a8db12cf5be860eeb",
    pass: "0f663d8a401192de25d46f6c22769e91"
  }
});

module.exports.send_validation = function(to, subject, text, html) {
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Gravacoin ✔ <admin@gravacoin.com>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: html // html body
  }

  if (env != 'test') {
    smtpTransport.sendMail(mailOptions, function(error, response){
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + response.message);
      }
    });
  }
  else {
    console.log("Message not sent because test mode :)")
    console.log(mailOptions);
  }
}
