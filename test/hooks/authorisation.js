var _ = require('lodash');
var autoroute = require('express-autoroute');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');
var bodyParser = require('body-parser');

var fixture = require('../fixtures/loadData');

var Chat = require('../models/chat')();

function successfulDelete(id) {
  return Chat.findOne({
    count: id,
  }).exec().then(function(chat) {
    return request(global.app).delete('/chats/' + chat._id).expect(204);
  }).then(() => {
    // check that it deleted
    return Chat.findOne({
      count: id,
    }).then((chat) => {
      expect(chat).to.be.null;
    });
  });
}

function successfulUpdate(id) {
  return Chat.findOne({
    count: id,
  }).exec().then(function(chat) {
    return request(global.app)
      .patch('/chats/' + chat._id)
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

describe.only('the authorisation hook', function() {
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
        request(global.app)
          .get('/chats')
          .expect(function(res) {
            expect(_.size(res.body.data)).to.equal(6);
          })
          .end(global.jsonAPIVerify(done));
      });
      it('should allow for direct access of authorised object', () => {
        return Chat.findOne({
          count: 6,
        }).exec().then(function(chat) {
          return request(global.app).get('/chats/' + chat._id).expect(200);
        });
      });
      it('should fail on access of unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).get('/chats/' + chat._id).expect(404);
        });
      });
    });

    describe('create', () => {
      it('should allow you to create items you are authorised to create'); // TODO: ?????
      it('should fail if you try to create an object you would be unauthorised to create'); // TODO: ??????
    });

    describe('delete', () => {
      it('should allow you to delete authorised items', () => {
        return successfulDelete(6);
      });

      it('should fail if you try to delete unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app).delete('/chats/' + chat._id).expect(404);
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
        return successfulUpdate(6);
      });

      it('should fail if you try to update unauthorised object', () => {
        return Chat.findOne({
          count: 8,
        }).exec().then(function(chat) {
          return request(global.app)
            .patch('/chats/' + chat._id)
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
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'scenarios', 'authorisation', 'global'),
      });
    });

    describe('find', () => {
      it('should return the right number of items based on authorisation', (done) => {
        request(global.app)
          .get('/chats')
          .expect(function(res) {
            expect(_.size(res.body.data)).to.equal(6);
          })
          .end(global.jsonAPIVerify(done));
      });
      it('should allow for direct access of authorised object', () => {
        return Chat.findOne({
          count: 6,
        }).exec().then(function(chat) {
          return request(global.app).get('/chats/' + chat._id).expect(200);
        });
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
            return successfulDelete(6);
          });
          it('should allow you to delete chat that does not pass the other block authorisation', () => {
            return successfulDelete(8);
          });
        });
        describe('update', () => {
          it('should allow you to update clearly authorised chat');
          it('should allow you to update chat that does not pass the other block authorisation');
        });
      });
    });

    describe('create', () => {
      it('should allow you to create items you are authorised to create'); // TODO: ?????
      it('should fail if you try to create an object you would be unauthorised to create'); // TODO: ??????
    });

    it('should limit delete', () => {
      it('should allow you to delete authorised items');
      it('should fail if you try to delete unauthorised object');
    });
    it('should limit update', () => {
      it('should allow you to update authorised items');
      it('should fail if you try to update unauthorised object');
    });
  });

  describe('global and local block definition', () => {
    // TODO: describe the behaviour of this
  });
});
