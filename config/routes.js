var routes = require('../routes')
  , address = require('../routes/address')
  , currency = require('../routes/currency');

function setup(app) {
  app.get('/', routes.index);

  app.get('/search', address.search);

  app.get('/:currency/:hash.png', address.show_currency_badge);
  app.get('/:hash.png', address.show_basic_badge);
  app.get('/:hash', address.show_profile);

  app.namespace('/api', function() {
    app.get('/currencies', currency.list);
    app.get('/:encrypted_email', address.show_all);
    app.get('/:encrypted_email/pending', address.show_pending);

    app.namespace('/:currency', function() {
      app.post('/addresses', address.create);
      app.get('/:encrypted_email', address.show);
      app.put('/:encrypted_email', address.update);
      app.get('/:encrypted_email/validate/:token', address.validate);
      app.get('/:encrypted_email/validate_change/:token', address.validate_address_change);
    });
  });
}

exports.setup = setup;
