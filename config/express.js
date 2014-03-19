var path = require('path')
  , express = require('express');

module.exports = function(app, config) {
  app.set('showStackError', true)

  app.set('port', process.env.PORT || 3000);

  app.set('views', path.join(config.root + '/views'));
  app.set('view engine', 'jade');
  // app.use(express.favicon());

  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());

  app.use(require('less-middleware')(path.join(config.root, 'public')));
  app.use(express.static(config.root + '/public/'));
  app.use(express.static(config.root + '/components/bootstrap/dist'));
  app.use(express.static(config.root + '/components/jquery/dist'));
  app.use(express.static(config.root + '/components/zeroclipboard'));
  app.use(express.static(config.root + '/components/angular'));
  app.use(express.static(config.root + '/components/angular-resource'));
  app.use(express.static(config.root + '/components/ng-clip/dest'));

  if (env == 'developement') {
    app.use(express.errorHandler());
  }

  app.use(app.router);
}
