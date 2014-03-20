var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator')
  , mailer = require('../config/mailer');


function validateAddress(str) {
  return validator.isAlphanumeric(str) && validator.isLength(str, 10, 50)
}

var AddressSchema = new Schema({
  'currency' : {
    type : Schema.ObjectId,
    ref : 'Currency',
    required : true,
    index : true
  },
  'address': { type: String, trim: true, required: true, validate: [validateAddress, 'Bad syntax']},
  'email': { type: String, trim: true, lowercase: true, validate: [validator.isEmail, 'an email is required']},
  'encrypted_email': { type: String, lowercase: true, validate: [validator.isAlphanumeric, 'encrypted_email is required']},
  'validated': {type: Boolean, default: false},
  'created_at': {type: Date, default: Date.now},
  'validated_at': {type: Date, default: null},
  'validation_token': {type: String, index: { unique: true }}
});

AddressSchema.pre('save', function(next, done) {
  var self = this;

  // Return if it's a save instead of a create
  if (!self.isNew) return next()

  self.email = self.email.toLowerCase();

  try {
    self.validation_token = crypto.randomBytes(16).toString('hex');
    self.encrypted_email = crypto.createHash('md5').update(self.email).digest("hex");
  } catch (e) {
    throw "Error in address model - Crypto generation failed"
  }

  mongoose.model('Address').search_by_email_and_currency(self.email, self.currency, function(err, match) {
    if (err) throw err;

    if (match)
      done(new Error("email must be unique for a given currency"));
    else {
      // Send validation mail
      text_message = "Your validation token is " + self.validation_token + " !"
      mailer.send_validation(self.email, "Validate your address", text_message);

      next();
    }
  });
})

AddressSchema.methods = {
  set_as_validated: function (callback) {
    this.validated = true;
    this.validated_at = Date.now();

    this.save(function(err) {
      if (err) throw err;

      callback();
    });
  }
}

AddressSchema.statics.search_by_email_and_currency = function(email, currency_id, cb) {
  return this.findOne({'email': email.toLowerCase(), currency: currency_id}).exec(cb);
}
AddressSchema.statics.search_by_encrypted_and_currency = function(encrypted_email, currency_id, cb) {
  return this.findOne({'encrypted_email': encrypted_email.toLowerCase(), currency: currency_id}).exec(cb);
}
AddressSchema.statics.search_validated_by_encrypted = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: true}).exec(cb);
}
AddressSchema.statics.search_by_encrypted = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase()}).exec(cb);
}
AddressSchema.statics.search_by_encrypted_validated = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: true}).exec(cb);
}
AddressSchema.statics.search_by_encrypted_not_validated = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: false}).exec(cb);
}

mongoose.model('Address', AddressSchema);

