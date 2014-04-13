env = process.env.NODE_ENV || 'development'
config = require('../config/config')[env]

var db = require('../models/db')
  , mongoose = require( 'mongoose' )
  , Currency = mongoose.model('Currency')
  , Address = mongoose.model('Address');

Currency.findOne({symbol: process.argv[2]}, function(err, currency) {
  if (err) throw err;
  if (!currency) throw "Currency not found !";

  Address.distinct(
      'address'
    , {currency: currency, validated: true}
    , function(err, results) {
      if (err) throw callback(err);

      if (results.length > 0) {
        var number = Math.floor(Math.random() * results.length);
        var winner = results[number];

        // console.log("Length == " + results.length + " and random number == " + number);
        // console.log("Picked address == " + winner);

        Address.find({address: winner}, function(err, addr) {
          console.log("And the winner is:")
          console.log("==================")
          console.log(addr);
          console.log("==================")
          mongoose.connection.close()
        });

      }
      else throw "No result found !"
  });
});
