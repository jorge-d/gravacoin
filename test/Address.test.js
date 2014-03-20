process.env.NODE_ENV = 'test'

var should = require('should')
  , assert = require('assert')
  , request = require('supertest')
  , mongoose = require('mongoose')
  , app = require('../app')
  , crypto = require('crypto')
  , validator = require('validator')
  , helper = require('./helper')
  , Address = mongoose.model('Address')
  , Currency = mongoose.model('Currency');

describe('Address', function() {
  var litecoin_address
    , litecoin
    , dogecoin
    , bitcoin
    , bitcoin_address;

  before(function (done) {
    helper.clearDb(done)
  })
  before(function (done) {
    Currency.create(
      { symbol: 'ltc', name: 'litecoin' }
    , { symbol: 'btc', name: 'bitcoin' }
    , { symbol: 'doge', name: 'dogecoin' }
    , function(err, ltc, btc, doge) {
      if (err) throw err;
      bitcoin = btc;
      litecoin = ltc;
      dogecoin = doge;
      done();
    });
  });

  before(function (done) {
    Address.create(
      {email: 'foobar@example.com', currency: bitcoin, address: '1W97yJxTfzYtYchzefxVPKqwoUb7Rx64M'}
    , {email: 'foobar@example.com', currency: litecoin, address: 'Lgs5HMfXMMHZA8wsmYtLb5XF8uTPHpq9Sa'}
    , function(err, btc_addr, ltc_addr) {
      if (err) throw err;

      bitcoin_address = btc_addr;
      litecoin_address = ltc_addr;

      done();
    });
  })

  describe('model', function() {
    it('encrypts email after save', function(done) {
      Address.search_by_email_and_currency(litecoin_address.email, litecoin, function(err, address) {
        address.encrypted_email.should.eql(crypto.createHash('md5').update(litecoin_address.email).digest("hex"));
        validator.isLowercase(address.encrypted_email).should.be.ok;
        done();
      });
    });
    it('generates a unique code', function(done) {
      Address.search_by_email_and_currency(litecoin_address.email, litecoin, function(err, address) {
        should.exist(address.validation_token);
        done();
      });
    });
    it('case insensitive email', function(done) {
      Address.create(
        {email: 'RanDomEmail@example.Com', currency: bitcoin, address: bitcoin_address.address}
      , {email: 'randomemail@example.com', currency: litecoin, address: litecoin_address.address}
      , function(err, addr_1, addr_2) {
        if (err) throw err;
        addr_1.encrypted_email.should.eql(addr_2.encrypted_email);
        done();
      });
    });
    it('invalid addresses', function(done) {
      var invalid_addresses = ['       a', 'dakjdwk', 'LQBGKmKAoxHGYre|k4EwF4g6Z2fyZ6wNSV', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'];
      var count = invalid_addresses.length;
      invalid_addresses.forEach(function(address) {
        Address.create(
          {email: 'some@one.fr', address: address, currency: bitcoin}
        , function(err, addr) {
          should.exist(err);
          if (--count === 0) done();
        });
      });
    });
  });

  describe('webpages routes', function() {

  });

  describe('api routes', function() {
    it('needs currency to exist', function(done) {
      request(app)
        .get('/api/undefined_currency/addresses')
        .expect(400, done)
    });

    // CREATE
    describe('POST /addresses', function() {
      var params = {
        email: 'los_locos_rocos@yopmail.fr',
        address: 'LQBGKmKAoxHGYre7k4EwF4g6Z2fyZ6wNSV'
      };

      it('fails without email', function(done) {
        request(app)
          .post('/api/' + litecoin.symbol + '/addresses')
          .send({address: params.address})
          .expect(400, done)
      });
      it('fails without address', function(done) {
        request(app)
          .post('/api/' + litecoin.symbol + '/addresses')
          .send({email: params.email})
          .expect(400, done)
      });
      it('saves addresses correctly', function(done) {
        request(app)
          .post('/api/' + litecoin.symbol + '/addresses')
          .send(params)
          .expect(200)
          .end(done)
      });

      it('should return error trying to save duplicate email', function(done) {
        request(app)
          .post('/api/' + litecoin.symbol + '/addresses')
          .send(params)
          .expect(400)
          .end(done)
      });
      it('allows same email for different currencies', function(done) {
        request(app)
          .post('/api/' + bitcoin.symbol + '/addresses')
          .send(params)
          .expect(200)
          .end(done)
      });
    });

    // LIST
    it('GET /addresses', function(done) {
      request(app)
        .get('/api/' + litecoin.symbol + '/addresses')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          Address.count({currency: litecoin}, function(err, cnt) {
            res.body.length.should.eql(cnt);
            done()
          })
        });
    });

    // SHOW
    describe('GET /:symbol/addresses/:encrypted_email', function() {
      it('with existing record', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email)
          .expect(200)
          .end(done)
      });
      it('is case insensitive', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email.toUpperCase())
          .expect(200)
          .end(done)
      });
      it('returns_error if invalid', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/record_that_does_not_exist')
          .expect(404)
          .end(done)
      });
    });

    // SHOW ALL | Profile calls
    describe('profile GET /addresses/:encrypted_email', function() {
      var person = {email: 'person_with_3_addresses_and_only_two_validated@yopmail.fr'};

      before(function(done) {
        Address.create(
          {email: person.email, currency: bitcoin, address: '1W97yJxTfzYtYchzefxVPKqwoUb7Rx64M', validated: true}
        , {email: person.email, currency: litecoin, address: 'Lgs5HMfXMMHZA8wsmYtLb5XF8uTPHpq9Sa', validated: true}
        , {email: person.email, currency: dogecoin, address: 'Lgs5HMfXMMHZA8wsmYtLb5XF8uTPHpq9Sa'}
        , function(err, btc_addr, ltc_addr, doge_addr) {
          if (err) throw err;

          person['btc'] = btc_addr;
          person['ltc'] = ltc_addr;
          person['doge'] = doge_addr;

          btc_addr.encrypted_email.should.eql(ltc_addr.encrypted_email);
          btc_addr.encrypted_email.should.eql(doge_addr.encrypted_email);
          done();
        });
      });
      it('it lists email for all currencies validated', function(done) {
        request(app)
          .get('/api/addresses/' + person.btc.encrypted_email)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            res.body.length.should.eql(2); // Only Bitcoin and Litecoin addresses are validated
            done();
          });
      });
      it('it returns no content if validated addresses does not exist', function(done) {
        request(app)
          .get('/api/addresses/someRandomUnexistingHash')
          .expect(204, done)
      });
      it('can list pending addresses', function(done) {
        request(app)
          .get('/api/addresses/' + person.btc.encrypted_email + '/pending')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            res.body.length.should.eql(1); // Dogecoin address
            done();
          });
      });
    });

    // VALIDATE
    describe('GET /addresses/:encrypted_email/validate/:token', function() {
      it('validates the model', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email + '/validate/' + litecoin_address.validation_token)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Address.search_by_email_and_currency(litecoin_address.email, litecoin, function(err, address) {
              should.exist(address.validated_at);
              address.validated.should.eql(true);

              request(app)
                .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email + '/validate/' + litecoin_address.validation_token)
                .expect(400)
                .end(function(err, res) {
                  res.body.error.should.eql("Address already validated");
                  done()
                });
            });
          });
      });
      it('handles error correctly', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email + '/validate/invalid_token')
          .expect(400)
          .end(function(err, res) {
            request(app)
              .get('/api/' + litecoin.symbol + '/addresses/invalid_email/validate/random_token')
              .expect(404, done)
          });
      });
    });
  });
});

