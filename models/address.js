var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator')
  , mailer = require('../config/mailer');

var AddressSchema = new Schema({
  'currency' : {
    type : Schema.ObjectId,
    ref : 'Currency',
    required : true,
    index : true
  },
  'email': { type: String, lowercase: true, validate: [validator.isEmail, 'an email is required']},
  'encrypted_email': { type: String, validate: [validator.isAlphanumeric, 'encrypted_email is required']},
  'validated': {type: Boolean, default: false},
  'created_at': {type: Date, default: Date.now},
  'validated_at': {type: Date, default: null},
  'validation_token': {type: String, index: { unique: true }}
});

AddressSchema.pre('save', function(next, done) {
  if (!this.isNew) return next()

  this.email = this.email.toLowerCase();
  try {
    this.validation_token = crypto.randomBytes(16).toString('hex');
    this.encrypted_email = crypto.createHash('md5').update(this.email).digest("hex");
  } catch (e) {
    throw "Error in address model - Crypto generation failed"
  }

  mongoose.models["Address"].search_by_email_and_currency(this.email, this.currency, function(err, match) {
    if (err) throw err;

    if (match)
      done(new Error("email must be unique for a given currency"));
    else {
      // Send valiodation mail
      text_message = "Your validation token is " + this.validation_token + " !"
      mailer.send_validation(this.email, "Validate your address", text_message);

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
  return this.findOne({'email': email, currency: currency_id}).exec(cb);
}
AddressSchema.statics.search_by_encrypted_and_currency = function(encrypted_email, currency_id, cb) {
  return this.findOne({'encrypted_email': encrypted_email, currency: currency_id}).exec(cb);
}

mongoose.model('Address', AddressSchema);

