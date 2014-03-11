var mongoose = require( 'mongoose' )
  , Address = mongoose.model('Address');

/*
 * GET address listing.
 */

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
    if (err) throw err;

    res.json(address);
  });
}
exports.create = function(req, res) {
  var address = new Address({email: req.query.address});
  address.save(function (err) {
    if (err) {
      console.log('Error:')
      console.log(err);
      return;
    }
    else {
      console.log('saved address! :-)');
    }

    res.send(200)
  });
}
