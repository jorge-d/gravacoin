process.env.NODE_ENV = 'test'

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');

var Address = mongoose.model('Address');

before(function (done) {
  require('./helper').clearDb(done)
})
after(function(done) {
  process.exit(0);
})

describe('Address', function() {
  var default_address = new Address({
    email: 'foobar@example.com'
  })

  before(function (done) {
    default_address.save(done)
  })

  describe('model', function() {

  });
  describe('routes', function() {
    describe('POST /addresses', function() {
      var params = {
        email: 'los_locos_rocos@yopmail.fr'
      };

      it('saves addresses correctly', function(done) {
        request(app)
          .post('/addresses')
          .send(params)
          .end(function(err, res) {
            if (err) {
              throw err;
            }
            res.should.have.status(200);
            done();
          });
      });

      it('should return error trying to save duplicate email', function(done) {
        request(app)
          .post('/addresses')
          .send(params)
          .end(function(err, res) {
            res.should.have.status(400);
            done();
          });
      });
    });

    it('GET /addresses', function(done) {
      request(app)
        .get('/addresses')
        .end(function(err, res) {
          if (err) throw err;

          res.should.have.status(200);
          Address.count(function (err, cnt) {
            res.body.length.should.eql(cnt);
            done()
          })
        });
    });

    describe('GET /addresses/:encrypted_email', function() {
      it('with existing record', function(done) {
        request(app)
          .get('/addresses/' + default_address.email)
          .end(function(err, res) {
            if (err) throw err;

            res.should.have.status(200);
            done()
          });
      });
      it('returns_error if invalid', function(done) {
        request(app)
          .get('/addresses/record_that_does_not_exist')
          .end(function(err, res) {
            if (err) throw err;

            res.should.have.status(404);
            done()
          });
      });
    });
  });
});
