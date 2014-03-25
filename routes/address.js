var mongoose = require( 'mongoose' )
  , request =  require('request')
  , Currency = mongoose.model('Currency')
  , Address = mongoose.model('Address');

function fetch_currency(req, res, callback) {
  Currency.findOne(
    {symbol: req.params.currency}
  , function(err, currency) {
    if (err) throw err;

    if (currency) callback(currency);
    else res.json(400, {error: 'Currency not found'})
  });
}

exports.list = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.find({currency: currency}, function(err, addresses) {
      if (err) throw err;

      res.json(addresses);
    });
  });
};

exports.show_all = function(req, res) {
  Address.search_by_encrypted_validated(req.params.encrypted_email, function(err, addresses) {
    if (err) res.json(400, err);
    else if (addresses.length === 0) res.send('', 204);
    else res.json(addresses);
  });
}
exports.show_pending = function(req, res) {
  Address.search_by_encrypted_not_validated(req.params.encrypted_email, function(err, addresses) {
    if (err) res.json(400, err);
    else if (addresses.length === 0) res.send('', 204);
    else res.json(addresses);
  });
}

exports.show = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.encrypted_email
    , currency
    , function (err, address) {
      if (err) throw err;
      else if (!address)
        res.json(404, {error: "Not found"})
      else
        res.json(address);
    });
  });
}

exports.create = function(req, res) {
  fetch_currency(req, res, function(currency) {
    var address = new Address({email: req.body.email, address: req.body.address});

    address.currency = currency;
    address.save(function (err) {
      if (err) {
        res.json(400, err);
      }
      else {
        res.json(200, {message: "Created ! Address now waiting for validation."});
      }
    });
  });
}

exports.update = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.encrypted_email
    , currency
    , function (err, address) {
      if (err) throw err;
      else if (!address)
        res.json(404, {error: "Not found"})
      else {
        address.change_address(req.body.new_address, function(err) {
          if (err) res.json(400, err);
          else res.json({message: "You should receive an email shortly containing a token and a link to validate the change"});
        });
      }
    });
  });
}

exports.validate_address_change = function(req, res) {
  var token = req.params.token;
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.encrypted_email
    , currency
    , function (err, address) {
      if (err) res.json(400, err);
      else if (!address) res.json(404, {error: "Not found"})
      else {
        address.validate_address_change(token, function(err) {
          if (err) res.json(400, err);
          else res.json(200);
        });
      }
    });
  });
}
exports.validate = function(req, res) {
  var token = req.params.token;
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.encrypted_email
    , currency
    , function (err, address) {
      if (err)
        res.json(404, err);
      else if (!address)
        res.json(404, {error: "Not found"})
      else if (address.validated)
        res.json(400, {error: "Address already validated"})
      else if (address.validation_token != token)
        res.json(400, {error: "invalid token"})
      else {
        address.set_as_validated(function() {
          res.json(200);
        });
      }
    });
  });
}

exports.show_profile = function(req, res) {
  var hash = req.params.hash;

  Address.search_by_encrypted(
    hash
  , function(err, addresses) {
    if (err) res.send(404);
    else
      res.render('profile', {
        hash: hash
      })
  });
}

exports.show_basic_badge = function(req, res) {
  Address.search_by_encrypted_validated(
    req.params.hash
  , function (err, address) {
    var url = 'http://b.repl.ca/v1/Donate-coins-FFC83C.png'
    if (err || address.length === 0)
      url = 'http://b.repl.ca/v1/Gravacoin-not%20found-red.png'

    request.get(url).pipe(res);
  });
}
exports.show_currency_badge = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.hash
    , currency
    , function (err, address) {
      var url = 'http://b.repl.ca/v1/Donate ' + currency.name + '-' + address.address + '-FFC83C.png'
      if (err || !address)
        url = 'http://b.repl.ca/v1/Gravacoin-Address%20not%20found-red.png'

      request.get(url).pipe(res);
    });
  });
}
