var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto');

function validatePresenceOf(value) {
  return value && value.length;
}

var AddressSchema = new Schema({
  'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  'encrypted_email': { type: String, validate: [validatePresenceOf, 'encrypted_email is required'], index: { unique: true } },
  'validated': {type: Boolean, default: false}
});

AddressSchema.pre('save', function(next) {
  if (!this.isNew) return next()

  if (this.email)
    this.encrypted_email = crypto.createHash('md5').update(this.email).digest("hex");
  next();
})

mongoose.model('Address', AddressSchema);

