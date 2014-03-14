var mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency');

exports.list = function(req, res) {
  Currency.find({}, {name: 1, symbol: 1, '_id': 0}, function(err, currencies) {
    if (err) throw err;

    res.json(currencies);
  });
};

exports.seed = function(req, res) {
  Currency.create(
      { symbol: 'ltc', name: 'litecoin' }
    , { symbol: 'btc', name: 'bitcoin' }
    , { symbol: 'doge', name: 'dogecoin' }
    , function (err) {
      if (err) res.json(400, err);
      else res.json(200, 'OK');
  });
}
