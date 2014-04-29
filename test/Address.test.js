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
      {email: 'foobar@example.com', currency: bitcoin, address: '1W97yJxTfzYtYchzefxVPKqwoUb7Rx64M', validated: true}
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
      Address.findOne({email: litecoin_address.email, currency: litecoin}, function(err, address) {
        should.exist(address.validation_token);
        done();
      });
    });
    it('case insensitive/trimed email', function(done) {
      Address.create(
        {email: 'RanDomEmail@example.Com', currency: bitcoin, address: bitcoin_address.address}
      , {email: 'randomemail@example.com', currency: litecoin, address: litecoin_address.address}
      , {email: ' randomemail@exaMple.com     ', currency: litecoin, address: litecoin_address.address}
      , function(err, addr_1, addr_2, addr_3) {
        if (err) throw err;
        addr_1.encrypted_email.should.eql(addr_2.encrypted_email);
        addr_1.encrypted_email.should.eql(addr_3.encrypted_email);
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
    describe('is possible to edit the address', function() {
      it('requires the address to be validated first', function(done) {
        Address.create(
          {email: 'random@lol.fr', currency: bitcoin, address: bitcoin_address.address}
          , function(err, address) {
            var old_token = address.validation_token
            var new_random_address = '59bcc3ad6775562f845953cf01624225'
            address.validated.should.not.be.ok;
            address.change_address(new_random_address, function(err) {
              should.exist(err);
              should.not.exist(address.pending_address);

              address.set_as_validated(function(err) {
                if (err) throw err;
                address.change_address(new_random_address, function(err) {
                  should.not.exist(err);
                  address.pending_address.should.eql(new_random_address);
                  address.validation_token.should.not.eql(old_token);

                  address.validate_address_change(address.validation_token, function(err) {
                    should.not.exist(err);
                    address.address.should.eql(new_random_address);
                    should.not.exist(address.pending_address);
                    done();
                  });
                });
              });
            });
        });
      });
      it('with invalid parameters (bad address or same than old)', function(done) {
        var invalid_new_addresses = ['       a', null, bitcoin_address.address];
        var count = invalid_new_addresses.length;
        invalid_new_addresses.forEach(function(new_address) {
          bitcoin_address.change_address(new_address, function(err) {
            should.exist(err);
            should.not.exist(bitcoin_address.pending_address);
            if (--count === 0) done();
          });
        });
      });
    });
  });

  // TODO : Write some tests for controllers (profile page & embed)
  describe('webpages routes', function() {

  });

  describe('api routes', function() {
    it('needs currency to exist', function(done) {
      request(app)
        .get('/api/undefined_currency/' + litecoin_address.encrypted_email)
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

    // SHOW
    describe('GET /:symbol/:encrypted_email', function() {
      it('with existing record', function(done) {
        request(app)
          .get('/api/' + bitcoin.symbol + '/' + bitcoin_address.encrypted_email)
          .expect(200)
          .end(done)
      });
      it('is case insensitive', function(done) {
        request(app)
          .get('/api/' + bitcoin.symbol + '/' + bitcoin_address.encrypted_email.toUpperCase())
          .expect(200)
          .end(done)
      });
      it('returns_error if invalid', function(done) {
        request(app)
          .get('/api/' + bitcoin.symbol + '/record_that_does_not_exist')
          .expect(404)
          .end(done)
      });
      it('returns_error if not validated', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/' + litecoin_address.encrypted_email)
          .expect(400)
          .end(done)
      });
    });

    // SHOW ALL | Profile calls
    describe('profile GET /:encrypted_email', function() {
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
          .get('/api/' + person.btc.encrypted_email)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            res.body.length.should.eql(2); // Only Bitcoin and Litecoin addresses are validated
            done();
          });
      });
      it('it returns no content if validated addresses does not exist', function(done) {
        request(app)
          .get('/api/someRandomUnexistingHash')
          .expect(204, done)
      });
      it('can list pending addresses', function(done) {
        request(app)
          .get('/api/' + person.btc.encrypted_email + '/pending')
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            res.body.length.should.eql(1); // Dogecoin address
            done();
          });
      });
    });

    // VALIDATE
    describe('GET /:encrypted_email/validate/:token', function() {
      it('validates the model', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/' + litecoin_address.encrypted_email + '/validate/' + litecoin_address.validation_token)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Address.search_by_email_and_currency(litecoin_address.email, litecoin, function(err, address) {
              should.exist(address.validated_at);
              address.validated.should.eql(true);

              request(app)
                .get('/api/' + litecoin.symbol + '/' + litecoin_address.encrypted_email + '/validate/' + litecoin_address.validation_token)
                .expect(400)
                .end(function(err, res) {
                  res.body.error.should.eql("Address already validated");
                  done()
                });
            });
          });
      });
      it('redirects on correct validation a "redirect" param is present', function(done) {
        Address.create(
            {email: litecoin_address.email, currency: dogecoin, address: 'Dgs5HMfXMMHZA8wsmYtLb5XF8uTPHpq9Sa'}
          , function(err, dogecoin_address) {
            if (err) throw err;
            request(app)
              .get('/api/' + dogecoin.symbol + '/' + dogecoin_address.encrypted_email + '/validate/' + dogecoin_address.validation_token + '?redirect')
              .expect(302)
              .end(function(err, res) {
                if (err) throw err;

                res.header['location'].should.eql('/' + dogecoin_address.encrypted_email);

                Address.search_by_email_and_currency(dogecoin_address.email, dogecoin, function(err, address) {
                  should.exist(address.validated_at);
                  address.validated.should.eql(true);
                  done();
                });
              });
        });
      });
      it('handles error correctly', function(done) {
        request(app)
          .get('/api/' + litecoin.symbol + '/' + litecoin_address.encrypted_email + '/validate/invalid_token')
          .expect(400)
          .end(function(err, res) {
            request(app)
              .get('/api/' + litecoin.symbol + '/invalid_email/validate/random_token')
              .expect(404, done)
          });
      });
    });

    // UPDATE a validated address
    it('PUT /api/:symbol/:encrypted_email/', function(done) {
      var new_address = '144107a75ad2cf5eeb32dfa62faa8b76';

      request(app)
        .put('/api/' + bitcoin.symbol + '/' + bitcoin_address.encrypted_email)
        .send({new_address: new_address})
        .expect(200)
        .end(function(err, res) {
          should.not.exist(err);

          Address.findOne({email: bitcoin_address.email, currency: bitcoin}, function(err, address) {
            address.pending_address.should.eql(new_address);

            request(app)
              .get('/api/' + bitcoin.symbol + '/' + bitcoin_address.encrypted_email + '/validate_change/' + address.validation_token)
              .expect(200)
              .end(function(err, res) {
                should.not.exist(err);

                Address.findOne({email: bitcoin_address.email, currency: bitcoin}, function(err, address) {
                  should.not.exist(address.pending_address);
                  address.address.should.eql(new_address);
                  done();
              });
            });
          });
        });
    });
  });
});

