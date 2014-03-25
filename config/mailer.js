var nodemailer = require("nodemailer");

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Mailjet",
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY
  }
});

function send_email(to, subject, text, html) {
  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "Gravacoin Admin ✔ <admin@gravaco.in>", // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    text: text, // plaintext body
    html: html // html body
  }

  // console.log('Sending email: ' + config.send_emails);
  // console.log('Content: ' + text);

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

module.exports.send_validation = function(address, currency) {
  // Send validation mail
  var text_message = "Hi\n" +
    "A request has been made to create through http://gravaco.in to add a new " + currency.name + " address.\n" +
    "To validate the following address: " + address.address + "\n" +
    "Please visit the following url: " + address.get_validation_url(currency) + "\n" +
    "If you have any issue, please contact admin@gravaco.in\n" +
    "Thank you for using Gravacoin!"

  send_email(address.email, "[Gravacoin] Validate your address", text_message);

}
module.exports.address_update = function(address, currency) {
  // Send validation mail
  var text_message = "Hi\n" +
    "A request has been made to change your " + currency.name + " address in http://gravaco.in\n" +
    "To validate this change to the following address: " + address.address + "\n" +
    "Please visit the following url: " + address.get_new_address_validation_url(currency) + "\n" +
    "If you have any issue, please contact admin@gravaco.in\n" +
    "Thank you for using Gravacoin!"

  send_email(address.email, "[Gravacoin] Validate your address modification", text_message);

}
