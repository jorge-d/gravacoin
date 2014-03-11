var mongoose = require('mongoose')
  , async = require('async')
  , Address = mongoose.model('Address')

exports.clearDb = function (done) {
  async.parallel([
    function (cb) {
      Address.collection.remove(cb)
    }
  ], done)
}
