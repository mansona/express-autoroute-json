var mongoose = require('mongoose');
var Q = require('q');
var express = require('express');
var http = require('http');
var Validator = require('jsonschema').Validator;

var httpServer;

Q.longStackSupport = true;

global.jsonAPIVerify = function(done) {
  return function(err, res) {
    if (err) throw err;

    var validator = new Validator();

    // eslint-disable-next-line global-require
    var result = validator.validate(res.body, require('./schema.json'));

    if (!result.valid) {
      done(result.errors);
    } else {
      done();
    }
  };
};

before(function() {
  if (!mongoose.connection.readyState) {
    mongoose.connect('mongodb://localhost/express-autoroute-json-test-database-piNMnJp8');
  }
});

beforeEach(function() {
  global.app = express();

  // create http server
  httpServer = http.createServer(global.app).listen(56773);
});

afterEach(function(done) {
  httpServer.close(done);
});