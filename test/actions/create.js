var autoroute = require('express-autoroute');
var expect = require('chai').expect;
var bodyParser = require('body-parser');

var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');

describe('the create block', function() {
  beforeEach(function() {
    global.app.use(bodyParser.json());
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should return status 201 if create exists', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'create'),
    });

    request(global.app).post('/chats', {
      chats: {
        name: 'name',
        count: 0,
      },
    }).expect(201).end(function(err, response) {
      expect(err).to.not.be.ok;
      expect(response.body).to.have.deep.property('chats._id');
      done();
    });
  });

  it('should be able to retrieve the created resource', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'create'),
    });

    request(global.app).post('/chats', {
      chats: {
        name: 'name',
        count: 0,
      },
    }).end(function(err, postResponse) {
      expect(err).to.not.be.ok;
      request(global.app).get('/chats/' + postResponse.body.chats._id)
        .expect(200).end(function(chatsErr, getResponse) {
          expect(chatsErr).to.not.be.ok;
          expect(postResponse.body._id).to.equal(getResponse.body._id);
          done();
        });
    });
  });
});
