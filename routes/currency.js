var mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency');

exports.list = function(req, res) {
  Currency.find({}, {name: 1, symbol: 1, url: 1, _id: 0}, function(err, currencies) {
    if (err) throw err;

    res.json(currencies);
  });
};
