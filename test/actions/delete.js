var autoroute = require('express-autoroute');
var bodyParser = require('body-parser');
var { expect } = require('chai');
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
      .end(global.jsonAPIVerify(done));
  });

  it('should return 404 if you try to delete something that doesn\'t exist', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    request(global.app)
      .delete('/chats/' + mongoose.Types.ObjectId())
      .expect(404)
      .end(global.jsonAPIVerify(done));
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
          if (err) return done(err);

          return Chat.findOne({
            _id: chat.id,
          }).then(function(secondChat) {
            expect(secondChat).to.not.be.ok;
          });
        });
    }).then(done, done);
  });

  it('should not delete anything if translateId returns nothing', function() {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    let initialCount;

    return Chat.count().then((count) => {
      initialCount = count;
    })
      .then(() => {
        return request(global.app)
          .delete('/conversations/face');
      })
      .then((response) => {
        expect(response.status).to.equal(404);
        return Chat.count();
      })
      .then((count) => {
        expect(count).to.eql(initialCount);
      });
  });

  it('should use translateId to pick the id for deletion', function() {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    return Chat.findOne().then(function(chat) {
      return request(global.app)
        .delete('/conversations/face')
        .query({ id: chat.id })
        .then((response) => {
          expect(response.status).to.equal(204);

          return Chat.findById(chat.id).then(function(secondChat) {
            expect(secondChat).to.not.be.ok;
          });
        });
    });
  });

  it('should respond with something if translateId errors', function() {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'delete'),
    });

    return request(global.app)
      .delete('/discussions/face')
      .then((response) => {
        expect(response.status).to.equal(500);
        expect(response.body).to.deep.include({ errors: [{ detail: 'I cant let you do that dave' }] });
      });
  });
});
