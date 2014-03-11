
/*
 * GET address listing.
 */

exports.list = function(req, res) {
  Address.find(function(err, ids) {
    if (err) {
     return next(err);
    }
    var addresses = [];
    var len = ids.length;
    var count = 0;
    if (len === 0) {
      return res.json(addresses);
    }
    ids.forEach(function (id) {
      var user = new Address();
      user.load(id, function (err, props) {
        if (err) {
          return next(err);
        }
        addresses.push(props);
        if (++count === len) {
          res.json(addresses);
        }
      });
    });
  });
};
exports.show = function(req, res) {
}
exports.create = function(req, res) {
  var address = nohm.factory('Address');
  address.p({
    email: req.query.address
  });
  address.save(function (err) {
    if (err === 'invalid') {
      console.log('properties were invalid: ', address.errors);
    } else if (err) {
      console.log(err); // database or unknown error
    } else {
      console.log('saved address! :-)');
    }
  });

  res.send(200)
}
