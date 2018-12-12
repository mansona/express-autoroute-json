var autoroute = require('express-autoroute');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');
var mongoose = require('mongoose');

var fixture = require('../fixtures/find-relationships/loadData');

var Person = require('../models/person')();

var Animal = require('../models/animal')();

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
              .to.have.nested.property('spouse.data.id', personTwo.id);
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });

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
              .to.have.nested.property('address.data.id', addressId.toString());
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });

  it('should work with arrays of relationship objects', function(done) {
    Person.findOne().then(function(person) {
      var pets = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];
      // person gets 4 dogs
      // eslint-disable-next-line no-param-reassign
      person.pets = pets;

      person.save().then(function() {
        request(global.app)
          .get('/people/' + person.id)
          .expect(200)
          .expect(function(res) {
            expect(res.body.data).to.have.property('relationships');
            expect(res.body.data.relationships)
              .to.have.nested.property('pets');
            expect(res.body.data.relationships)
              .to.have.nested.property('pets.data[0].id', pets[0].toString());
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });

  it('should include requested relationships for findOne', function(done) {
    Person.find().then(function(people) {
      var personOne = people[0];
      var personTwo = people[1];

      var cat = new Animal({ name: 'Platypus' });
      var dog = new Animal({ name: 'Dogbark' });

      // one-to-one
      personOne.spouse = personTwo;
      // one-to-many
      personOne.pets.push(cat, dog);

      Promise.all([
        cat.save(),
        dog.save(),
        personOne.save(),
      ]).then(function() {
        request(global.app)
          // .get(`/people/${personOne.id}?include=spouse,dinosaurs`)
          .get(`/people/${personOne.id}?include=spouse,pets,dinosaurs`)
          .expect(200)
          .expect(function(res) {
            var { data, included } = res.body;
            expect(data).to.have.property('relationships');
            expect(data.relationships).to.not.have.property('dinosaurs');

            // Spouse one-to-one. Two keys; not accidentally the whole document.
            expect(data.relationships).to.have.nested.property('spouse.data.id', personTwo.id);
            expect(data.relationships).to.have.nested.property('spouse.data.type', 'people');
            expect(Object.keys(data.relationships.spouse.data)).to.have.lengthOf(2);

            // Pets. Same treatment, but for one-to-many
            expect(data.relationships).to.have.nested.property('pets.data');
            expect(data.relationships.pets.data).to.be.a('array');
            expect(data.relationships.pets.data).to.have.lengthOf(2);
            expect(data.relationships).to.have.nested.property('pets.data[0].id', cat.id);
            expect(data.relationships).to.have.nested.property('pets.data[0].type', 'animals');

            // Data should be included
            expect(included).to.be.a('array');
            expect(included).to.have.lengthOf(3);
            expect(included).to.deep.include({ type: 'animals', id: dog.id, attributes: { name: 'Dogbark' } });
            expect(included).to.deep.include({ type: 'animals', id: cat.id, attributes: { name: 'Platypus' } });
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });

  it('should include requested relationships for findMany', function(done) {
    Person.find().then(function(people) {
      var personTwo = people[1];
      var cat = new Animal({ name: 'Platypus' });
      var dog = new Animal({ name: 'Dogbark' });
      var queue = [];

      people.forEach((person) => {
        // one-to-one
        // eslint-disable-next-line no-param-reassign
        person.spouse = personTwo;
        // one-to-many
        person.pets.push(cat, dog);
        queue.push(person.save());
      });

      Promise.all([
        cat.save(),
        dog.save(),
        Promise.all(queue),
      ]).then(function() {
        request(global.app)
          // .get(`/people/${personOne.id}?include=spouse,dinosaurs`)
          .get('/people/?include=spouse,pets,dinosaurs')
          .expect(200)
          .expect(function(res) {
            var { data, included } = res.body;

            expect(data).to.be.a('array');
            expect(data).to.have.nested.property('[0].id');
            expect(data).to.have.nested.property('[0].type', 'people');
            expect(data).to.have.nested.property('[0].attributes.age');
            expect(data).to.have.nested.property('[0].relationships');
            expect(data).to.have.nested.property('[0].relationships.pets.data[0].type', 'animals');
            expect(data).to.not.have.nested.property('[0].relationships', 'dinosaurs');

            // Two keys; not accidentally the whole document.
            expect(Object.keys(data[0].relationships.spouse.data)).to.have.lengthOf(2);
            expect(Object.keys(data[0].relationships.pets.data[0])).to.have.lengthOf(2);

            // Data should be included
            expect(included).to.be.a('array');
            expect(included).to.have.lengthOf(3);
            // eslint-disable-next-line object-curly-newline
            expect(included).to.deep.include({ type: 'animals', id: dog.id, attributes: { name: 'Dogbark' }, relationships: {} });
            // eslint-disable-next-line object-curly-newline
            expect(included).to.deep.include({ type: 'animals', id: cat.id, attributes: { name: 'Platypus' }, relationships: {} });
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });
});
