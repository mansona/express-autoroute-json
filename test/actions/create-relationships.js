var autoroute = require('express-autoroute');
var bodyParser = require('body-parser');
var { expect } = require('chai');
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');

var Person = require('../models/person')();

describe('the create block with relationships', function() {
  beforeEach(function() {
    global.app.use(bodyParser.json());

    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'create-relationships'),
    });

    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should add relationship to the object if its on the request body', function(done) {
    var spouseId = new mongoose.Types.ObjectId();
    request(global.app)
      .post('/people')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'namey mc nameface',
            age: 29,
          },
          relationships: {
            spouse: {
              data: {
                type: 'people',
                id: spouseId,
              },
            },
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body).to.have.nested.property('data.id');
        expect(res.body).to.have.nested.property('data.attributes.name', 'namey mc nameface');
        expect(res.body)
          .to.have.nested.property('data.relationships.spouse.data.id', spouseId.toString());
      })
      .end(global.jsonAPIVerify(done));
  });

  it('should add array relationships to the object if its on the request body', function(done) {
    var dogId = new mongoose.Types.ObjectId();
    var catId = new mongoose.Types.ObjectId();
    request(global.app)
      .post('/people')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'namey mc nameface',
            age: 29,
          },
          relationships: {
            pets: {
              data: [{
                type: 'animals',
                id: dogId,
              }, {
                type: 'animals',
                id: catId,
              }],
            },
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body).to.have.nested.property('data.id');
        expect(res.body).to.have.nested.property('data.attributes.name', 'namey mc nameface');
        expect(res.body.data.relationships.pets.data).to.deep.include({
          type: 'animals',
          id: dogId.toString(),
        });
        expect(res.body.data.relationships.pets.data).to.deep.include({
          type: 'animals',
          id: catId.toString(),
        });
      })
      .end(global.jsonAPIVerify(done));
  });

  it('should camelCase relationship keys if they are dasherized', function(done) {
    var inlawId = new mongoose.Types.ObjectId();
    request(global.app)
      .post('/people')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'namey mc nameface',
            age: 29,
          },
          relationships: {
            'in-law': {
              data: {
                type: 'people',
                id: inlawId,
              },
            },
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body)
          .to.have.nested.property('data.relationships.in-law.data.id', inlawId.toString());
      })
      .end(function(err, res) {
        expect(err).to.not.be.ok;

        Person.findOne({
          _id: res.body.data.id,
        })
          .then(function(person) {
            expect(person).to.have.property('inLaw');
            global.jsonAPIVerify(done)(err, res);
          })
          .then(null, done);
      });
  });

  it('should not have a relationship if it is not on the request body', function(done) {
    request(global.app)
      .post('/people')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'namey mc nameface',
            age: 29,
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body).to.have.nested.property('data.id');
        expect(res.body).to.have.nested.property('data.attributes.name', 'namey mc nameface');
        expect(res.body)
          .to.have.nested.property('data.relationships.spouse.data', null);
      })
      .end(global.jsonAPIVerify(done));
  });

  it('should not add relationships that are not on the model', function(done) {
    var monkeyfaceId = new mongoose.Types.ObjectId();
    request(global.app)
      .post('/people')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'namey mc nameface',
            age: 29,
          },
          relationships: {
            monkeyface: {
              type: 'people',
              data: monkeyfaceId,
            },
          },
        },
      })
      .expect(201)
      .expect(function(res) {
        expect(res.body).to.have.nested.property('data.id');
        expect(res.body).to.have.nested.property('data.attributes.name', 'namey mc nameface');
        expect(res.body)
          .to.have.nested.property('data.relationships.spouse.data', null);
        expect(res.body)
          .to.not.have.deep.property('data.relationships.monkeyface');
      })
      .end(global.jsonAPIVerify(done));
  });
});
