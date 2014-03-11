
/**
 * Module dependencies.
 */

var express = require('express');

// Load configurations
env = process.env.NODE_ENV || 'development'
config = require('./config/config')[env]

app = express();

require('./models/db')
require('./config/express')(app, config);
require('./config/routes').setup(app);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

// expose app
exports = module.exports = app;
