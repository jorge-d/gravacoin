process.env.NODE_ENV = 'test'

var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var app = require('../app');

var Address = mongoose.model('Address');

describe('Address', function() {
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
  it('lists existing addresses', function(done) {
    request(app)
      .get('/addresses')
      .end(function(err, res) {
        if (err) throw err;

        res.should.have.status(200);
        Address.count(function (err, cnt) {
          res.body.length.should == cnt;
          done()
        })
      });
  });

  after(function (done) {
    require('./helper').clearDb(done)
  })
  after(function(done) {
    process.exit(0);
  })
});
