var autoroute = require('express-autoroute');
var bodyParser = require('body-parser');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');

var Chat = require('../models/chat')();

describe('the delete block', function() {
  beforeEach(function() {
    global.app.use(bodyParser.json());
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should return 404 if you try to delete something with an invalid ObjectId', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    request(global.app)
      .delete('/chats/sflskdjflsdkjfFACEFACE')
      .expect(404)
      .end(done);
  });

  it('should return 404 if you try to delete something that doesn\'t exist', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    request(global.app)
      .delete('/chats/' + mongoose.Types.ObjectId())
      .expect(404)
      .end(done);
  });

  it('should return nothing with a status of 204 if successful', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    Chat.findOne().then(function(chat) {
      request(global.app)
        .delete('/chats/' + chat.id)
        .expect(204)
        .end(done);
    });
  });

  it('should remove item from the database if successfully deleted', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    Chat.findOne().then(function(chat) {
      request(global.app)
        .delete('/chats/' + chat.id)
        .end(function(err) {
          expect(err).to.not.be.ok;

          Chat.findOne({
            _id: chat.id,
          }).then(function(secondChat) {
            expect(secondChat).to.not.be.ok;
          }).then(done, done);
        });
    });
  });
});
