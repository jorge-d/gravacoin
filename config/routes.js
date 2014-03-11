var routes = require('../routes')
  , address = require('../routes/address');

function setup(app) {
  app.get('/', routes.index);
  app.get('/addresses', address.list);
  app.post('/addresses', address.create);
  app.get('/addresses/:encrypted_email', address.show);
}

exports.setup = setup;
