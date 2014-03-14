exports.clearDb = function (done) {
  var mongoose = require('mongoose')
    , async = require('async')
    , Address = mongoose.model('Address')
    , Currency = mongoose.model('Currency');

  async.parallel([
    function (cb) {
      Address.collection.remove(cb)
    },
    function (cb) {
      Currency.collection.remove(cb)
    },
  ], done)
}
