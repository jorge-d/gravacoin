var mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency');

exports.list = function(req, res) {
  Currency.find({}, {name: 1, symbol: 1, url: 1}, function(err, currencies) {
    if (err) throw err;

    res.json(currencies);
  });
};

exports.show = function(req, res) {
  Currency.findOne(
    {_id: req.params.id}
  , {name: 1, symbol: 1, url: 1}
  , function (err, currency) {
    if (err) throw err;
    else if (!currency)
      res.json(404, {error: "Not found"})
    else
      res.json(currency);
  });
}

exports.seed = function(req, res) {
  Currency.create(
      {name: 'Bitcoin', symbol: 'btc', url: 'http://bitcoin.org'}
    , {name: 'Litecoin', symbol: 'ltc', url: 'http://litecoin.org'}
    , {name: 'PPCoin', symbol: 'ppc', url: 'http://peercoin.net'}
    , {name: 'Dogecoin', symbol: 'doge', url: 'http://dogecoin.com'}
    , {name: 'Namecoin', symbol: 'nmc', url: 'http://namecoin.info'}
    , {name: 'Feathercoin', symbol: 'ftc', url: 'http://feathercoin.com'}
    , {name: 'NovaCoin', symbol: 'nvc', url: 'http://novacoin.org'}
    , {name: 'Worldcoin', symbol: 'wdc', url: 'http://worldcoinalliance.net'}
    , {name: 'Devcoin', symbol: 'dvc', url: 'http://devcoin.org'}
    , {name: 'Freicoin', symbol: 'frc', url: 'http://freico.in'}
    , {name: 'Ixcoin', symbol: 'ixc', url: 'http://ixcoin.co'}
    , {name: 'Terracoin', symbol: 'trc', url: 'http://terracoin.org'}
    , {name: 'Digitalcoin', symbol: 'dgc', url: 'http://digitalcoin.co'}
    , {name: 'Mincoin', symbol: 'mnc', url: 'http:///mincoin.io'}
    , {name: 'BBQCoin', symbol: 'bqc', url: 'http://bbqcoin.org'}
    , function (err) {
      if (err) res.json(400, err);
      else res.json(200, 'OK');
  });
}
