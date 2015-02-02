
/**
 * Module dependencies.
 */

var namespace = require('express-namespace');
var axm = require('axm');
axm.http();

axm.catchAll();

var http = require('http');

var express = require('express');

// Load configurations
env = process.env.NODE_ENV || 'development'
config = require('./config/config')[env]
app = express();

require('./models/db')
require('./config/express')(app, config);
require('./config/routes').setup(app);

app.use(axm.expressErrorHandler());

app.set('port', process.env.PORT || config.port);

app.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));

// expose app
exports = module.exports = app;
