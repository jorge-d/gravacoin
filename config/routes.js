var routes = require('../routes')
  , address = require('../routes/address')
  , currency = require('../routes/currency');

function setup(app) {
  app.get('/', routes.index);

  app.get('/seed', currency.seed);

  app.get('/:hash', address.show_profile);

  app.namespace('/api', function() {
    app.get('/currencies', currency.list);
    app.get('/currencies/:id', currency.show);
    app.get('/addresses/:encrypted_email', address.show_all);

    app.namespace('/:currency', function() {
      app.get('/addresses', address.list);
      app.post('/addresses', address.create);
      app.get('/addresses/:encrypted_email', address.show);
      app.get('/addresses/:encrypted_email/validate/:token', address.validate);
    });
  });
}

exports.setup = setup;
