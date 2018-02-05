var _ = require('lodash');
var autoroute = require('express-autoroute');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');
var bodyParser = require('body-parser');

var fixture = require('../fixtures/loadData');

var Chat = require('../models/chat')();

function successfulDelete(id, route) {
  return Chat.findOne({
    count: id,
  }).exec().then(function(chat) {
    return request(global.app).delete(`/${route}/${chat._id}`).expect(204);
  }).then(() => {
    // check that it deleted
    return Chat.findOne({
      count: id,
    }).then((chat) => {
      expect(chat).to.be.null;
    });
  });
}

function successfulUpdate(id, route) {
  return Chat.findOne({
    count: id,
  }).exec().then(function(chat) {
    return request(global.app)
      .patch(`/${route}/${chat._id}`)
      .set('Accept', 'application/json')
      .send({
        data: {
          attributes: {
            name: 'super awesome new name',
          },
          type: 'chats',
        },
      })
      .expect(200);
  }).then(() => {
    // check that it deleted
    return Chat.findOne({
      count: id,
    }).then((chat) => {
      expect(chat).to.have.property('name', 'super awesome new name');
    });
  });
}

function findAllCount(count, done, route) {
  request(global.app)
    .get(`/${route}`)
    .expect(function(res) {
      expect(_.size(res.body.data)).to.equal(count);
    })
    .end(global.jsonAPIVerify(done));
}

function successfulFindOne(id, route) {
  return Chat.findOne({
    count: id,
  }).exec().then(function(chat) {
    return request(global.app).get(`/${route}/${chat._id}`).expect(200);
  });
}

describe('the authorisation hook', function() {
  beforeEach(function() {
    // reset app
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  describe('global definition', () => {
    beforeEach(() => {
      global.app.use(bodyParser.json());
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'scenarios', 'authorisation', 'global'),
      });
    });
    describe('find', () => {
      it('should return the right number of items based on authorisation', (done) => {
        findAllCount(6, done, 'scenarios-authorisation-global-chats');
      });
      it('should allow for direct access of authorised object', () => {
        return successfulFindOne(6, 'scenarios-authorisation-global-chats');
      });
      it('should fail on access of unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).get('/scenarios-authorisation-global-chats/' + chat._id).expect(404);
        });
      });
    });

    describe('create', () => {
      it('should allow you to create items you are authorised to create'); // TODO: ?????
      it('should fail if you try to create an object you would be unauthorised to create'); // TODO: ??????
    });

    describe('delete', () => {
      it('should allow you to delete authorised items', () => {
        return successfulDelete(6, 'scenarios-authorisation-global-chats');
      });

      it('should fail if you try to delete unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).delete('/scenarios-authorisation-global-chats/' + chat._id).expect(404);
        }).then(() => {
          // check that it didn't delete
          return Chat.findOne({
            count: 8,
          }).then((chat) => {
            expect(chat).to.be.ok;
          });
        });
      });
    });

    describe('update', () => {
      it('should allow you to update authorised items', () => {
        return successfulUpdate(6, 'scenarios-authorisation-global-chats');
      });

      it('should fail if you try to update unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app)
            .patch('/scenarios-authorisation-global-chats/' + chat._id)
            .set('Accept', 'application/json')
            .send({
              data: {
                attributes: {
                  name: 'super awesome new name',
                },
                type: 'chats',
              },
            })
            .expect(404);
        }).then(() => {
          // check that it deleted
          return Chat.findOne({
            count: 8,
          }).then((chat) => {
            expect(chat).to.have.property('name', 'person8');
          });
        });
      });
    });
  });

  describe('local block definition', () => {
    beforeEach(() => {
      global.app.use(bodyParser.json());
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'scenarios', 'authorisation', 'find'),
      });
    });

    describe('find', () => {
      it('should return the right number of items based on authorisation', (done) => {
        findAllCount(6, done, 'scenarios-authorisation-find-chats');
      });
      it('should allow for direct access of authorised object', () => {
        return successfulFindOne(6, 'scenarios-authorisation-find-chats');
      });
      it('should fail on access of unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).get('/chats/' + chat._id).expect(404);
        });
      });

      describe('should not affect other routes', () => {
        // describe('create'); // TODO ???
        describe('delete', () => {
          it('should allow you to delete clearly authorised chat', () => {
            return successfulDelete(6, 'scenarios-authorisation-find-chats');
          });
          it('should allow you to delete chat that does not pass the other block authorisation', () => {
            return successfulDelete(8, 'scenarios-authorisation-find-chats');
          });
        });
        describe('update', () => {
          it('should allow you to update clearly authorised chat', () => {
            return successfulUpdate(6, 'scenarios-authorisation-find-chats');
          });
          it('should allow you to update chat that does not pass the other block authorisation', () => {
            return successfulUpdate(8, 'scenarios-authorisation-find-chats');
          });
        });
      });
    });

    describe('create', () => {
      it('should allow you to create items you are authorised to create'); // TODO: ?????
      it('should fail if you try to create an object you would be unauthorised to create'); // TODO: ??????
    });

    describe('delete', () => {
      beforeEach(() => {
        global.app.use(bodyParser.json());
        autoroute(global.app, {
          throwErrors: true,
          routesDir: path.join(process.cwd(), 'test', 'fixtures', 'scenarios', 'authorisation', 'delete'),
        });
      });

      it('should allow you to delete authorised items', () => {
        return successfulDelete(6, 'scenarios-authorisation-delete-chats');
      });

      it('should fail if you try to delete unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).delete('/scenarios-authorisation-delete-chat/' + chat._id).expect(404);
        }).then(() => {
          // check that it didn't delete
          return Chat.findOne({
            count: 8,
          }).then((chat) => {
            expect(chat).to.be.ok;
          });
        });
      });

      describe('should not affect other routes', () => {
        describe('find', () => {
          it('should allow you to see all resources', (done) => {
            findAllCount(10, done, 'scenarios-authorisation-delete-chats');
          });
          it('should allow you to retrieve clearly authorised chat', () => {
            return successfulFindOne(6, 'scenarios-authorisation-delete-chats');
          });
          it('should allow you to retrieve chat that does not pass the other block authorisation', () => {
            return successfulFindOne(8, 'scenarios-authorisation-delete-chats');
          });
        });
        // describe('create'); // TODO ???
        describe('update', () => {
          it('should allow you to update clearly authorised chat', () => {
            return successfulUpdate(6, 'scenarios-authorisation-find-chats');
          });
          it('should allow you to update chat that does not pass the other block authorisation', () => {
            return successfulUpdate(8, 'scenarios-authorisation-find-chats');
          });
        });
      });
    });

    describe('update', () => {
      beforeEach(() => {
        global.app.use(bodyParser.json());
        autoroute(global.app, {
          throwErrors: true,
          routesDir: path.join(process.cwd(), 'test', 'fixtures', 'scenarios', 'authorisation', 'update'),
        });
      });
      it('should allow you to update authorised items', () => {
        return successfulUpdate(6, 'scenarios-authorisation-update-chats');
      });
      it('should fail if you try to update unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app)
            .patch('/scenarios-authorisation-update-chats/' + chat._id)
            .set('Accept', 'application/json')
            .send({
              data: {
                attributes: {
                  name: 'super awesome new name',
                },
                type: 'chats',
              },
            })
            .expect(404);
        }).then(() => {
          // check that it deleted
          return Chat.findOne({
            count: 8,
          }).then((chat) => {
            expect(chat).to.have.property('name', 'person8');
          });
        });
      });

      describe('should not affect other routes', () => {
        describe('find', () => {
          it('should allow you to see all resources', (done) => {
            findAllCount(10, done, 'scenarios-authorisation-update-chats');
          });
          it('should allow you to retrieve clearly authorised chat', () => {
            return successfulFindOne(6, 'scenarios-authorisation-update-chats');
          });
          it('should allow you to retrieve chat that does not pass the other block authorisation', () => {
            return successfulFindOne(8, 'scenarios-authorisation-update-chats');
          });
        });
        // describe('create'); // TODO ???
        describe('delete', () => {
          it('should allow you to delete clearly authorised chat', () => {
            return successfulDelete(6, 'scenarios-authorisation-update-chats');
          });
          it('should allow you to delete chat that does not pass the other block authorisation', () => {
            return successfulDelete(8, 'scenarios-authorisation-update-chats');
          });
        });
      });
    });
  });

  describe('global and local block definition', () => {
    // TODO: describe the behaviour of this
  });
});
