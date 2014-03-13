var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator');

var AddressSchema = new Schema({
  'email': { type: String, validate: [validator.isEmail, 'an email is required'], index: { unique: true } },
  'encrypted_email': { type: String, validate: [validator.isAlphanumeric, 'encrypted_email is required'], index: { unique: true } },
  'validated': {type: Boolean, default: false},
  'created_at': {type: Date, default: Date.now},
  'validated_at': {type: Date, default: null},
  'validation_token': {type: String, index: { unique: true }}
});

AddressSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  try {
    this.validation_token = crypto.randomBytes(16).toString('hex');
    this.encrypted_email = crypto.createHash('md5').update(this.email).digest("hex");
  } catch (e) {
    throw "Error in address model - Crypto generation failed"
  }
  next();
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

mongoose.model('Address', AddressSchema);

