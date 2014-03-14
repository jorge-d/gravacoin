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
  var litecoin_address;
  var litecoin;
  var bitcoin;
  var bitcoin_address;

  before(function (done) {
    require('./helper').clearDb(done)
  })
  before(function (done) {
    litecoin = new Currency({
      symbol: 'ltc',
      name: 'litecoin'
    });
    bitcoin = new Currency({
      symbol: 'btc',
      name: 'bitcoin'
    });
    litecoin_address = new Address({
      email: 'foobar@example.com'
    });
    bitcoin_address = new Address({
      email: 'ltc@example.com'
    });

    litecoin.save(function() {
      bitcoin.save(function() {
        litecoin_address.currency = litecoin._id;
        litecoin_address.save(function() {
          bitcoin_address.currency = bitcoin._id;
          bitcoin_address.save(done);
        });
      });
    })
  })

  describe('model', function() {
    it('encrypts email after save', function(done) {
      Address.findOne({email: litecoin_address.email}, function(err, address) {
        address.encrypted_email.should.eql(crypto.createHash('md5').update(litecoin_address.email).digest("hex"));
        done();
      });
    });
    it('generates a unique code', function(done) {
      Address.findOne({email: litecoin_address.email}, function(err, address) {
        should.exist(address.validation_token);
        done();
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
        email: 'los_locos_rocos@yopmail.fr'
      };

      it('fails without email', function(done) {
        request(app)
          .post('/api/' + litecoin.symbol + '/addresses')
          .send({})
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
          .expect(404)
          .end(function(err, res) {
            res.should.have.status(400);
            done();
          });
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
    describe('GET /addresses/:encrypted_email', function() {
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

    // VALIDATE
    describe('GET /addresses/:encrypted_email/validate/:token', function() {
      it('validates the model', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/addresses/' + litecoin_address.encrypted_email + '/validate/' + litecoin_address.validation_token)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Address.findOne({email: litecoin_address.email}, function(err, address) {
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

