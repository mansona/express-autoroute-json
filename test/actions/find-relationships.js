var autoroute = require('express-autoroute');
var expect = require('chai').expect;
var path = require('path');
var request = require('supertest');
var mongoose = require('mongoose');

var fixture = require('../fixtures/find-relationships/loadData');

var Person = require('../models/person')();

describe('the find block with relationships', function() {
  beforeEach(function() {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-relationships'),
    });

    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should show a valid relationship block when available', function(done) {
    Person.find().then(function(people) {
      var personOne = people[0];
      var personTwo = people[1];

      // they get married
      personOne.spouse = personTwo;
      personTwo.spouse = personOne;

      personOne.save().then(function() {
        return personTwo.save();
      }).then(function() {
        request(global.app)
          .get('/people/' + personOne.id)
          .expect(200)
          .expect(function(res) {
            expect(res.body.data).to.have.property('relationships');
            expect(res.body.data.relationships)
              .to.have.deep.property('spouse.data.id', personTwo.id);
          })
          .end(global.jsonAPIVerify(done));
      })
      .then(null, done);
    });
  });

  // eslint-disable-next-line max-len
  it('should show relationship blocks even if there is no mongoose model available', function(done) {
    Person.findOne().then(function(person) {
      var addressId = new mongoose.Types.ObjectId();
      // person buys a house
      // eslint-disable-next-line no-param-reassign
      person.address = addressId;

      person.save().then(function() {
        request(global.app)
          .get('/people/' + person.id)
          .expect(200)
          .expect(function(res) {
            expect(res.body.data).to.have.property('relationships');
            expect(res.body.data.relationships)
              .to.have.deep.property('address.data.id', addressId.toString());
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });
});
