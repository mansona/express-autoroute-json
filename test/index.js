var mongoose = require('mongoose');
var Q = require('q');
var express = require('express');
var http = require('http');
var { Validator } = require('jsonschema');

var dbConnectionString = process.env.DB_CONNECTION_STRING || 'mongodb://localhost/express-autoroute-json-test-database-piNMnJp8';
var httpServer;

Q.longStackSupport = true;

global.validateJSONAPI = function(res) {
  var validator = new Validator();

  // eslint-disable-next-line global-require
  var result = validator.validate(res.body, require('./schema.json'));

  if (!result.valid) {
    throw new Error(result.errors);
  }
};

global.jsonAPIVerify = function(done) {
  return function(err, res) {
    if (err) throw err;

    try {
      global.validateJSONAPI(res);
    } catch (e) {
      return done(e);
    }

    return done();
  };
};

before(function() {
  if (!mongoose.connection.readyState) {
    mongoose.connect(dbConnectionString);
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

after(function() {
  mongoose.disconnect();
});
