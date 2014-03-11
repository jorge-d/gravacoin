
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var address = require('./routes/address');
var http = require('http');
var path = require('path');

nohm = require('nohm').Nohm;
redis = require('redis').createClient();

redis.on("connect", function() {
  nohm.setClient(redis);
  console.log("Nohm Connected to Redis Client");
});

Address = require('./models/address')

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
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/addresses', address.list);
app.get('/addresses/create', address.create);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
