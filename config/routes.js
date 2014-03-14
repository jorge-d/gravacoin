var routes = require('../routes')
  , address = require('../routes/address');

function setup(app) {
  app.get('/', routes.index);

  app.namespace('/api/:currency', function() {
    app.get('/addresses', address.list);
    app.post('/addresses', address.create);
    app.get('/addresses/:encrypted_email', address.show);
    app.get('/addresses/:encrypted_email/validate/:token', address.validate);
  });
}

exports.setup = setup;
