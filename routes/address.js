var mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency')
  , Address = mongoose.model('Address');

exports.list = function(req, res) {
  Address.find({}, function(err, addresses) {
    if (err) throw err;

    res.json(addresses);
  });
};
exports.show = function(req, res) {
  Address.findOne(
    { encrypted_email: req.params.encrypted_email }
  , function (err, address) {
    if (err)
      res.json(404, err);
    else if (!address)
      res.json(404, {error: "Not found"})
    else
      res.json(address);
  });
}
exports.create = function(req, res) {
  var address = new Address({email: req.body.email});
  Currency.findOne({symbol: 'ltc'}, function(err, currency) {
    if (err) throw err;

    if (currency) {
      address.currency = currency._id;
      address.save(function (err) {
        if (err) {
          res.json(400, err);
        }
        else
          res.json(200, {message: "Created ! Address now waiting for validation."});
      });
    }
  });
}

exports.validate = function(req, res) {
  token = req.params.token;
  Address.findOne(
    { encrypted_email: req.params.encrypted_email }
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
}
