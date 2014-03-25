// Bring Mongoose into the app
var mongoose = require( 'mongoose' );

// Bootstrap db connection
// Connect to mongodb

var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect(config.db.url, options)
}
connect()

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err)
})

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose connection disconnected, closing application');
  process.exit(0);
})

mongoose.connection.on('connected', function () {
  if (config.db.debug)
    console.log('Mongoose default connection open');
});
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

mongoose.set('debug', config.db.debug);

// BRING IN YOUR SCHEMAS & MODELS
// For example
require('./currency');
require('./address');
