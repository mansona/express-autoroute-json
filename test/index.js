var mongoose = require('mongoose');
var Q = require('q');
var express = require('express');
var http = require('http');

var httpServer;

Q.longStackSupport = true;

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
