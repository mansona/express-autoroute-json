var autoroute = require('express-autoroute');
var bodyParser = require('body-parser');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');
const mongoose = require('mongoose');

var fixture = require('../fixtures/update-relationships/loadData');

var Person = require('../models/person')();

describe('the update block with relationships', function() {
  beforeEach(function() {
    global.app.use(bodyParser.json());
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update-relationships'),
    });

    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should be able to remove relationship with patch', function(done) {
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
          .patch('/people/' + personOne.id)
          .type('application/json')
          .send({
            data: {
              relationships: {
                spouse: {
                  data: null,
                },
              },
            },
          })
          .expect(200)
          // eslint-disable-next-line consistent-return
          .end(function(err) {
            if (err) return done(err);

            Person.findOne({
              _id: personOne.id,
            }).then(function(updatedPersonOne) {
              expect(updatedPersonOne.spouse).to.equal(null);
            })
              .then(done, done);
          });
      })
        .then(null, done);
    });
  });

  it('should be able to add a relationship with patch', function(done) {
    Person.find().then(function(people) {
      var personOne = people[0];
      var personTwo = people[1];

      // they get married
      request(global.app)
        .patch('/people/' + personOne.id)
        .type('application/json')
        .send({
          data: {
            relationships: {
              spouse: {
                data: {
                  type: 'people',
                  id: personTwo.id,
                },
              },
            },
          },
        })
        .expect(200)
        // eslint-disable-next-line consistent-return
        .end(function(err) {
          if (err) return done(err);

          request(global.app)
            .patch('/people/' + personTwo.id)
            .type('application/json')
            .send({
              data: {
                relationships: {
                  spouse: {
                    data: {
                      type: 'people',
                      id: personOne.id,
                    },
                  },
                },
              },
            })
            .expect(200)
            // eslint-disable-next-line consistent-return
            .end(function(firstError) {
              if (firstError) return done(err);

              // verify the two are married in the database
              Person.findOne({
                _id: personOne.id,
              }).then(function(updatedPersonOne) {
                expect(updatedPersonOne.spouse.toString()).equal(personTwo.id.toString());
                return Person.findOne({
                  _id: personTwo.id,
                });
              })
                .then(function(updatedPersonTwo) {
                  expect(updatedPersonTwo.spouse.toString()).equal(personOne.id.toString());
                })
                .then(done, done);
            });
        });
    });
  });

  it('should be able to add an array relationship with patch', function() {
    var dogId = new mongoose.Types.ObjectId();
    var catId = new mongoose.Types.ObjectId();

    return Person.find().then(function(people) {
      var personOne = people[0];

      // get some pets
      return request(global.app)
        .patch('/people/' + personOne.id)
        .type('application/json')
        .send({
          data: {
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
        .expect(200)
        .then(() => {
          return Person.findOne({
            _id: personOne.id,
          }).then(function(updatedPersonOne) {
            expect(updatedPersonOne.pets).to.have.length(2);
          });
        });
    });
  });
});
