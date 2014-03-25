var routes = require('../routes')
  , address = require('../routes/address')
  , currency = require('../routes/currency');

function setup(app) {
  app.get('/', routes.index);

  app.get('/:currency/:hash.png', address.show_currency_badge);
  app.get('/:hash.png', address.show_basic_badge);
  app.get('/:hash', address.show_profile);

  app.namespace('/api', function() {
    app.get('/currencies', currency.list);
    app.get('/addresses/:encrypted_email', address.show_all);
    app.get('/addresses/:encrypted_email/pending', address.show_pending);

    app.namespace('/:currency', function() {
      app.get('/addresses', address.list);
      app.post('/addresses', address.create);
      app.get('/addresses/:encrypted_email', address.show);
      app.get('/addresses/:encrypted_email/validate/:token', address.validate);
    });
  });
}

exports.setup = setup;
