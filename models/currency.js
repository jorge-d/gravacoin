var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , validator = require('validator');

var CurrencySchema = new Schema({
  'symbol': { type: String, lowercase: true, validate: [validator.isAlpha, 'can only contain letters'], index: { unique: true } },
  'name': { type: String, validate: [validator.isAlpha, 'can only contain letter'], index: { unique: true } },
  'url': { type: String },
  'created_at': {type: Date, default: Date.now}
});

CurrencySchema.methods = {
}

mongoose.model('Currency', CurrencySchema);

