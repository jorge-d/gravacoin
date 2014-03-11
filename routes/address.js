var mongoose = require( 'mongoose' )
  , Address = mongoose.model('Address');


exports.list = function(req, res) {
  Address.find({}, function(err, addresses) {
    if (err) throw err;

    res.json(addresses);
  });
};
exports.show = function(req, res) {
  Address.findOne(
    { email: req.params.encrypted_email }
  , function (err, address) {
    if (err)
      res.json(err);
    else
      res.json(address);
  });
}
exports.create = function(req, res) {
  var address = new Address({email: req.query.address});
  address.save(function (err) {
    if (err) {
      res.send(400, err);
    }
    else
      res.send(200)
  });
}
