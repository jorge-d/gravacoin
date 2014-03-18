process.env.NODE_ENV = 'test'

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');
var crypto = require('crypto');

var Address = mongoose.model('Address');
var Currency = mongoose.model('Currency');

describe('Address', function() {
  var litecoin_address
    , litecoin
    , bitcoin
    , bitcoin_address;

  before(function (done) {
    require('./helper').clearDb(done)
  })
  before(function (done) {
    Currency.create(
      { symbol: 'ltc', name: 'litecoin' }
    , { symbol: 'btc', name: 'bitcoin' }
    , function(err, ltc, btc) {
      Address.create(
        {email: 'foobar@example.com', currency: btc._id, address: '1W97yJxTfzYtYchzefxVPKqwoUb7Rx64M'}
      , {email: 'foobar@example.com', currency: ltc._id, address: 'Lgs5HMfXMMHZA8wsmYtLb5XF8uTPHpq9Sa'}
      , function(err, btc_addr, ltc_addr) {
        bitcoin_address = btc_addr;
        litecoin_address = ltc_addr;
        bitcoin = btc;
        litecoin = ltc;

        done();
      });
    });
  })

  describe('model', function() {
    it('encrypts email after save', function(done) {
      Address.search_by_email_and_currency(litecoin_address.email, litecoin._id, function(err, address) {
        address.encrypted_email.should.eql(crypto.createHash('md5').update(litecoin_address.email).digest("hex"));
        done();
      });
    });
    it('generates a unique code', function(done) {
      Address.search_by_email_and_currency(litecoin_address.email, litecoin._id, function(err, address) {
        should.exist(address.validation_token);
        done();
      });
    });
    it('invalid addresses', function(done) {
      var invalid_addresses = ['       a', 'dakjdwk', 'LQBGKmKAoxHGYre|k4EwF4g6Z2fyZ6wNSV', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'];
      var count = invalid_addresses.length;
      invalid_addresses.forEach(function(address) {
        Address.create(
          {email: 'some@one.fr', address: address, currency: bitcoin._id}
        , function(err, addr) {
          should.exist(err);
          if (--count == 0) done();
        });
      });
    });
  });
  describe('routes', function() {
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

          Address.count({currency: litecoin._id}, function(err, cnt) {
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
      it('returns_error if invalid', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/record_that_does_not_exist')
          .expect(404)
          .end(done)
      });
    });

    // SHOW ALL
    it('GET /addresses/:encrypted_email', function(done) {
      request(app)
        .get('/api/addresses/' + litecoin_address.encrypted_email)
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          Address.count({email: litecoin_address.email}, function(err, cnt) {
            res.body.length.should.eql(cnt);
            done();
          })
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

            Address.search_by_email_and_currency(litecoin_address.email, litecoin._id, function(err, address) {
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

