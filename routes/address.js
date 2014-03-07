
/*
 * GET users listing.
 */

exports.list = function(req, res) {
  db.smembers('addresses', function(err, values) {
    res.send(values);
  });
};
exports.show = function(req, res) {
}
exports.create = function(req, res) {
  db.sadd('addresses', req.query.address, db.print);
  res.send(200)
}
