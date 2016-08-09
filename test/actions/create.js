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

    request(global.app)
      .post('/chats')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'name',
            count: 0,
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body).to.have.deep.property('data.id');
        expect(res.body).to.have.deep.property('data.attributes.name', 'name');
      })
      .end(global.jsonAPIVerify(done));
  });

  it('should be able to retrieve the created resource', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'create'),
    });

    request(global.app)
    .post('/chats')
    .type('application/json')
    .send({
      data: {
        type: 'chats',
        attributes: {
          name: 'name',
          count: 0,
        },
      },
    })
    .end(function(err, postResponse) {
      expect(err).to.not.be.ok;
      request(global.app).get('/chats/' + postResponse.body.data.id)
        .expect(200)
        .expect(function(getResponse) {
          expect(postResponse.body.data.id).to.equal(getResponse.body.data.id);
          expect(getResponse.body.data).to.have.deep.property('attributes.name', 'name');
        })
        .end(global.jsonAPIVerify(done));
    });
  });
});
