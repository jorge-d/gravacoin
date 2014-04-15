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

        console.log("Length == " + results.length + " and random number == " + number);
        // console.log("Picked address == " + winner);

        Address.find({address: winner}, function(err, addr) {
          if (addr.length != 1) throw "Only one profile is authorized"

          console.log("And the winner is:")
          console.log("==================")
          console.log({address: addr[0].address, hash: addr[0].encrypted_email});
          console.log("==================")


          console.log("\n\n\n\n")
          console.log(addr);
          mongoose.connection.close()
        });

      }
      else throw "No result found !"
  });
});
