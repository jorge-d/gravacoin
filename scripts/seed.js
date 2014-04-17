env = process.env.NODE_ENV || 'development'
config = require('../config/config')[env]

var db = require('../models/db')
  , mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency');

handleRes = function(err) {
  if (err)
    console.log(err);
  else
    console.log('OK');
  mongoose.connection.close()
}

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
  , {name: 'Zetacoin', symbol: 'zet', url: 'http://zetacoin.cc'}
  , {name: 'Megacoin', symbol: 'mec', url: 'http://megacoin.in'}
  , {name: 'BlackCoin', symbol: 'bc', url: 'http://blackcoin.co'}
  , {name: 'DarkCoin', symbol: 'drk', url: 'http://darkcoin.io'}
  , handleRes
);

