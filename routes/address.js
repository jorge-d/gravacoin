var mongoose = require('mongoose')
  , request =  require('request')
  , Currency = mongoose.model('Currency')
  , Address = mongoose.model('Address')
  , mailer = require('../config/mailer');

function fetch_currency(req, res, callback) {
  Currency.findOne(
    {symbol: req.params.currency}
  , function(err, currency) {
    if (err) throw err;

    if (currency) callback(currency);
    else res.json(400, {error: 'Currency not found'})
  });
}

exports.show_all = function(req, res) {
  Address.search_by_encrypted_validated(req.params.encrypted_email, function(err, addresses) {
    if (err) res.json(400, err);
    else if (addresses.length === 0) res.send('', 204);
    else res.json(addresses);
    }
  , 'encrypted_email address validated currency -_id');
}
exports.show_pending = function(req, res) {
  Address.search_by_encrypted_not_validated(req.params.encrypted_email, function(err, addresses) {
    if (err) res.json(400, err);
    else if (addresses.length === 0) res.send('', 204);
    else res.json(addresses);
    }
  , 'encrypted_email address validated currency -_id');
}

exports.show = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency(
      req.params.encrypted_email
    , currency
    , function (err, address) {
      if (err) throw err;
      else if (!address) res.send(404, "Not found")
      else if (!address.validated) res.send(400, "Address waiting for validation")
      else res.end(address.address);
    });
  });
}

exports.create = function(req, res) {
  if (!req.body.email)
    res.json(400, {error: "Missing 'email' parameter"});
  else if (!req.body.address)
    res.json(400, {error: "Missing 'address' parameter"});
  else
    fetch_currency(req, res, function(currency) {
      var address = new Address({email: req.body.email, address: req.body.address, currency: currency});
      address.save(function (err) {
        if (err) res.json(400, {error: "An error occured, check that the email doesn't already exist for the given currency"});
        else {
          mailer.send_validation(address, currency);
          res.json(200, {message: "Created ! Waiting for validation.", hash: address.encrypted_email})
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
          if (err) {
            console.log('penis')
            console.log(err)
            res.json(400, {error: "An error occured, maybe the new address is the same than the existing one?"});
          }
          else {
            mailer.address_update(address, currency);
            res.json({message: "You should receive an email shortly containing a token and a link to validate the change"});
          }
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
      else if (!address) res.json(404, "Not found")
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

  if (hash) hash = hash.trim().toLowerCase();

  Address.search_by_encrypted_validated(
    hash
  , function(err, addresses) {
    if (err)
      res.send(404);
    else if (addresses.length === 0)
      res.redirect('/search?hash=' + hash);
    else
      res.render('profile', { hash: hash, gravatar_url: 'http://www.gravatar.com/avatar/' + hash })
  });
}

exports.show_basic_badge = function(req, res) {
  Address.search_by_encrypted_validated(
    req.params.hash
  , function (err, address) {
    var url;

    if (err || address.length === 0)
      url = 'http://b.repl.ca/v1/Gravacoin-not%20found-red.png';
    else
      url = 'http://b.repl.ca/v1/Donate-coins-53AEFF.png';

    request.get(url).pipe(res);
  });
}
exports.show_currency_badge = function(req, res) {
  fetch_currency(req, res, function(currency) {
    Address.search_by_encrypted_and_currency_validated(
      req.params.hash
    , currency
    , function (err, address) {
      var url;

      if (err || !address)
        url = 'http://b.repl.ca/v1/Gravacoin-Address%20not%20found-red.png';
      else
        url = 'http://b.repl.ca/v1/' + currency.name + '-' + address.address + '-53AEFF.png';

      request.get(url).pipe(res);
    });
  });
}

exports.search = function(req, res) {
  var email = req.query.email || '';

  if (email.length > 0)
    res.redirect('/' + Address.get_encrypted_email_for_email(email));
  else
    res.render('search', {
      email: email,
      hash: req.query.hash,
      display_error: (req.query.hash || email.length)
    });
}
