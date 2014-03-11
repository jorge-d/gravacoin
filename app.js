
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

// Load configurations
// if test env, load example file
env = process.env.NODE_ENV || 'development'
config = require('./config/config')[env]

var db = require('./models/db')
app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);

var lessCompiler = require( 'express-less-middleware' )( './public/' );
app.use(lessCompiler);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var routes = require('./routes');
var address = require('./routes/address');

app.get('/', routes.index);
app.get('/addresses', address.list);
app.get('/addresses/create', address.create);
app.get('/addresses/:encrypted_email', address.show);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
