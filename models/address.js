var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator');


function validateAddress(str) {
  return validator.isAlphanumeric(str) && validator.isLength(str, 10, 50)
}
function generateRandomToken() {
  try {
    return crypto.randomBytes(16).toString('hex');
  } catch(e) {
    throw "Error in address model - Crypto generation failed"
  }
}
function encryptEmail(email) {
  try {
    return crypto.createHash('md5').update(email).digest("hex");
  } catch(e) {
    throw "Error in address model - Crypto generation failed"
  }
}

var AddressSchema = new Schema({
  'currency' : {
    type : Schema.ObjectId,
    ref : 'Currency',
    required : true,
    index : true
  },
  'address': { type: String, trim: true, required: true, validate: [validateAddress, 'Bad syntax']},
  'pending_address': { type: String, trim: true, required: false},
  'email': { type: String, trim: true, required: true, lowercase: true, validate: [validator.isEmail, 'an email is required']},
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

  self.validation_token = generateRandomToken();
  self.encrypted_email = encryptEmail(self.email);

  // Validate that this email is not already registered on this currency
  mongoose.model('Address').search_by_email_and_currency(self.email, self.currency, function(err, match) {
    if (err) done(err);
    else if (match) done(new Error("email must be unique for a given currency"));
    else next();
  });
})

AddressSchema.methods = {
  validate_address_change: function(token, callback) {
    var self = this;

    if (!self.pending_address)
      callback(new Error('No address pending for change'))
    else if (token != self.validation_token)
      callback(new Error('Token does not match'))
    else
      self.address = self.pending_address;
      self.pending_address = undefined;
      self.save(callback);
  },
  set_as_validated: function (callback) {
    this.validated = true;
    this.validated_at = Date.now();

    this.save(function(err) {
      if (err) throw err;

      callback();
    });
  },
  change_address: function(new_address, callback) {
    var self = this;

    if (!self.validated)
      callback(new Error('The email is still pending validation, the address cannot be updated'))
    else if (self.pending_address)
      callback(new Error('An address change is already pending'))
    else if (new_address === self.address)
      callback(new Error('The new address must be different from the existing one'))
    else if (!validateAddress(new_address))
      callback(new Error('Bad syntax for new address'))
    else {
      this.validation_token = generateRandomToken();
      this.pending_address = new_address;

      this.save(function(err) {
        callback(err);
      });
    }
  },
  get_validation_url: function(currency) {
    return "http://gravaco.in/api/" + currency.symbol + '/addresses/' + this.encrypted_email + '/validate/' + this.validation_token
  },
  get_new_address_validation_url: function(currency) {
    return "http://gravaco.in/api/" + currency.symbol + '/addresses/' + this.encrypted_email + '/validate_change/' + this.validation_token

  }
}

AddressSchema.statics.search_by_email_and_currency = function(email, currency_id, cb) {
  return this.findOne({'email': email.toLowerCase(), currency: currency_id}).populate('currency').exec(cb);
}
AddressSchema.statics.search_by_encrypted_and_currency = function(encrypted_email, currency_id, cb) {
  return this.findOne({'encrypted_email': encrypted_email.toLowerCase(), currency: currency_id}).populate('currency').exec(cb);
}
AddressSchema.statics.search_validated_by_encrypted = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: true}).populate('currency').exec(cb);
}
AddressSchema.statics.search_by_encrypted = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase()}).populate('currency').exec(cb);
}
AddressSchema.statics.search_by_encrypted_validated = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: true}).populate('currency').exec(cb);
}
AddressSchema.statics.search_by_encrypted_not_validated = function(encrypted_email, cb) {
  return this.find({encrypted_email: encrypted_email.toLowerCase(), validated: false}).populate('currency').exec(cb);
}

mongoose.model('Address', AddressSchema);

