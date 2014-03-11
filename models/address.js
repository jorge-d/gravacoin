var mongoose = require('mongoose')
  , Schema = mongoose.Schema

function validatePresenceOf(value) {
  return value && value.length;
}

var AddressSchema = new Schema({
  'email': { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
  'validated': {type: Boolean, default: false}
});

mongoose.model('Address', AddressSchema);

