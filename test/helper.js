exports.clearDb = function (done) {
  var mongoose = require('mongoose')
    , async = require('async')
    , Address = mongoose.model('Address')

  async.parallel([
    function (cb) {
      Address.collection.remove(cb)
    }
  ], done)
}
