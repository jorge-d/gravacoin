process.env.NODE_ENV = 'test'

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');
var crypto = require('crypto');

var Address = mongoose.model('Address');

describe('Address', function() {
  var default_address;

  before(function (done) {
    require('./helper').clearDb(done)
  })
  before(function (done) {
    default_address = new Address({
      email: 'foobar@example.com'
    });
    default_address.save(done)
  })

  describe('model', function() {
    it('encrypts email after save', function(done) {
      Address.findOne({email: default_address.email}, function(err, address) {
        address.encrypted_email.should.eql(crypto.createHash('md5').update(default_address.email).digest("hex"));
        done();
      });
    });
    it('generates a unique code', function(done) {
      Address.findOne({email: default_address.email}, function(err, address) {
        should.exist(address.validation_token);
        done();
      });
    });
  });
  describe('routes', function() {
    describe('POST /addresses', function() {
      var params = {
        email: 'los_locos_rocos@yopmail.fr'
      };

      it('fails without email', function(done) {
        request(app)
          .post('/addresses')
          .send({})
          .expect(400, done)
      });
      it('saves addresses correctly', function(done) {
        request(app)
          .post('/addresses')
          .send(params)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            done();
          });
      });

      it('should return error trying to save duplicate email', function(done) {
        request(app)
          .post('/addresses')
          .send(params)
          .expect(404)
          .end(function(err, res) {
            res.should.have.status(400);
            done();
          });
      });
    });

    it('GET /addresses', function(done) {
      request(app)
        .get('/addresses')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;

          Address.count(function (err, cnt) {
            res.body.length.should.eql(cnt);
            done()
          })
        });
    });

    describe('GET /addresses/:encrypted_email', function() {
      it('with existing record', function(done) {
        request(app)
          .get('/addresses/' + default_address.encrypted_email)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            done()
          });
      });
      it('returns_error if invalid', function(done) {
        request(app)
          .get('/addresses/record_that_does_not_exist')
          .expect(404)
          .end(function(err, res) {
            if (err) throw err;

            done()
          });
      });
    });
    describe('GET /addresses/:encrypted_email/validate/:token', function() {
      it('validates the model', function(done) {
        request(app)
          .get('/addresses/' + default_address.encrypted_email + '/validate/' + default_address.validation_token)
          .expect(200)
          .end(function(err, res) {
            if (err) throw err;

            Address.findOne({email: default_address.email}, function(err, address) {
              should.exist(address.validated_at);
              address.validated.should.eql(true);

              request(app)
                .get('/addresses/' + default_address.encrypted_email + '/validate/' + default_address.validation_token)
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
          .get('/addresses/' + default_address.encrypted_email + '/validate/invalid_token')
          .expect(400)
          .end(function(err, res) {
            request(app)
              .get('/addresses/invalid_email/validate/random_token')
              .expect(404, done)
          });
      });
    });
  });
});

