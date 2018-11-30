var autoroute = require('express-autoroute');
var bodyParser = require('body-parser');
var { expect } = require('chai');
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');

var Chat = require('../models/chat')();
var Project = require('../models/project')();

describe('the update block', function() {
  beforeEach(function() {
    global.app.use(bodyParser.json());
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should return 404 if you try to update something with an invalid ObjectId', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    request(global.app)
      .patch('/chats/sflskdjflsdkjfFACEFACE')
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'name',
            count: 0,
          },
        },
      })
      .expect(404)
      .end(global.jsonAPIVerify(done));
  });

  it('should return 404 if you try to update something that doesn\'t exist', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    request(global.app)
      .patch('/chats/' + mongoose.Types.ObjectId())
      .type('application/json')
      .send({
        data: {
          attributes: {
            name: 'name',
            count: 0,
          },
        },
      })
      .expect(404)
      .end(global.jsonAPIVerify(done));
  });

  it('should not effect the object if you submit a patch with a bad attribute', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    Chat.findOne().then(function(chat) {
      var originalChat = chat.toJSON();
      request(global.app)
        .patch('/chats/' + chat.id)
        .type('application/json')
        .send({
          data: {
            attributes: {
              super: 'face',
            },
          },
        })
        .expect(200)
        .end(function(err, response) {
          if (err) return done(err);

          return Chat.findOne({
            _id: chat.id,
          }).then(function(updatedChat) {
            expect(originalChat).to.deep.equal(updatedChat.toJSON());
            global.jsonAPIVerify(done)(err, response);
          }).then(null, done);
        });
    });
  });
  it('should only change one parameter with a patch with one value', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    Chat.findOne().then(function(chat) {
      var originalChat = chat.toJSON();
      request(global.app)
        .patch('/chats/' + chat.id)
        .type('application/json')
        .send({
          data: {
            attributes: {
              count: chat.count + 10,
            },
          },
        })
        .expect(200)
        .end(function(err, response) {
          if (err) return done(err);

          return Chat.findOne({
            _id: chat.id,
          }).then(function(updatedChat) {
            expect(updatedChat).to.have.property('count', originalChat.count + 10);
            expect(updatedChat).to.have.property('name', originalChat.name);
            global.jsonAPIVerify(done)(err, response);
          }).then(null, done);
        });
    });
  });

  it('should update all values that are in the patch', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    Chat.findOne().then(function(chat) {
      var originalChat = chat.toJSON();
      var newName = 'this is a super new name';
      request(global.app)
        .patch('/chats/' + chat.id)
        .type('application/json')
        .send({
          data: {
            attributes: {
              count: chat.count + 10,
              name: newName,
            },
          },
        })
        .expect(200)
        .end(function(err, response) {
          if (err) return done(err);

          return Chat.findOne({
            _id: chat.id,
          }).then(function(updatedChat) {
            expect(updatedChat).to.have.property('count', originalChat.count + 10);
            expect(updatedChat).to.have.property('name', newName);
            global.jsonAPIVerify(done)(err, response);
          }).then(null, done);
        });
    });
  });

  it('should respond with the correct data after patch', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update'),
    });

    Chat.findOne().then(function(chat) {
      var originalChat = chat.toJSON();
      var newName = 'this is a super new name';
      request(global.app)
        .patch('/chats/' + chat.id)
        .type('application/json')
        .send({
          data: {
            attributes: {
              count: chat.count + 10,
              name: newName,
            },
          },
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body).to.have.nested.property('data.attributes.count', originalChat.count + 10);
        })
        .end(global.jsonAPIVerify(done));
    });
  });

  it('should convert dasherized patch to camelCase', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'updateProjects'),
    });

    Project.create({
      isActive: false,
    }).then(function(project) {
      expect(project).to.have.property('isActive', false);
      request(global.app)
        .patch('/projects/' + project.id)
        .type('application/json')
        .send({
          data: {
            attributes: {
              'is-active': true,
            },
          },
        })
        .expect(200)
        .end(function(err, response) {
          if (err) return done(err);

          return Project.findOne({
            _id: project.id,
          }).then(function(updatedProject) {
            expect(updatedProject).to.have.property('isActive', true);
            global.jsonAPIVerify(done)(err, response);
          }).then(null, done);
        });
    }).then(null, done);
  });

  describe('- alternative id -', function() {
    it('should allow for a "me" route implementation', function() {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'update-alternative-id'),
      });

      return Project.create({
        title: 'This is my project!!!',
        description: 'in the update-alternative-id test',
      }).then((project) => {
        return request(global.app)
          .patch(`/pears/me?createdProject=${project.id}`)
          // .type('application/json')
          .send({
            data: {
              attributes: {
                title: 'more respectful title',
              },
            },
          })
          .then((response) => {
            global.validateJSONAPI(response);

            expect(response.body.data.id).to.equal('me');

            return Project.findById(project.id).then((updatedProject) => {
              expect(updatedProject).to.have.property('title', 'more respectful title');
            });
          });
      });
    });
  });
});
