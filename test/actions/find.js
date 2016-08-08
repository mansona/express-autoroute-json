var _ = require('lodash');
var autoroute = require('express-autoroute');
var expect = require('chai').expect;
var path = require('path');
var request = require('supertest');
var winston = require('winston');

var fixture = require('../fixtures/loadData');

var authorisationFunction = require('../../lib/authorisation');
var queryFunction = require('../../lib/query');
var Chat = require('../models/chat')();

describe('the find block', function() {
  beforeEach(function() {
    // reset app
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should return return status 200 when find is present', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find'),
    });

    request(global.app).get('/chats').expect(200).end(done);
  });

  it('should return 404 when there is no find object', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'modelOnly'),
    });

    request(global.app).get('/chats').expect(404).end(done);
  });

  it('should return return all models when find is present', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find'),
    });

    request(global.app).get('/chats').expect(200).expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(10);
    })
    .end(done);
  });

  it('should return only return models that fit the query', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findQuery'),
    });

    request(global.app).get('/chats?min=3').expect(200).expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(7);
    })
    .end(done);
  });

  it('should return a sorted array of objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'sortDown'),
    });

    request(global.app).get('/chats?sortup=true').expect(200).expect(function(res) {
      expect(res.body.chats).to.deep.equal(_.sortBy(res.body.chats, function(item) {
        return item.count;
      }));
    })
    .end(done);
  });

  it('should return a reverse sorted array of objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'sortDown'),
    });

    request(global.app).get('/chats?sortdown=true').expect(200).expect(function(res) {
      expect(res.body.chats).to.deep.equal(_.sortBy(res.body.chats, function(item) {
        return 1 - item.count;
      }));
    })
    .end(done);
  });

  it('should allow authenticated users to get objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authentication'),
    });

    request(global.app).get('/chats?userlevel=max').expect(200).expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(10);
    })
    .end(done);
  });

  it('should not allow authenticated users to get objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authentication'),
    });

    request(global.app).get('/chats?userlevel=noob').expect(401).end(done);
  });

  it('should only allow me to see the number of users i am allowed to see', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    request(global.app).get('/chats').expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(5);
    }).end(done);
  });

  it('should combine authorisation and query correctly', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    request(global.app).get('/chats?min=3').expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(2);
    }).end(done);
  });

  it('should not allow me to see items that I am not authorised to see', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    Chat.findOne({
      count: 8,
    }).exec().then(function(chat) {
      request(global.app).get('/chats/' + chat._id).expect(404).end(done);
    });
  });

  // eslint-disable-next-line max-len
  it('should restrict a query to only allow me to see the number of users i am allowed to see', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    request(global.app).get('/chats?min=3').expect(function(res) {
      expect(_.size(res.body.chats)).to.equal(2);
    }).end(done);
  });

  // TODO convert this to a real test now that we've removed mockgoose
  it.skip('should build an $and query when there are competing restrictions', function() {
    var options = {
      model: require('./models/chat')(),
      find: {
        authorisation: function(req) {
          if (req.query.userlevel) {
            return {
              count: {
                $lt: req.query.userlevel,
              },
            };
          }
        },

        query: function(req) {
          if (req.query.min) {
            return {
              count: {
                $gt: req.query.min,
              },
            };
          }
        },
      },
    };
    var req = {
      query: {
        userlevel: 6,
        min: 3,
      },
    };

    authorisationFunction(options)(req, {}, function() {}),

      queryFunction(options)(req, {}, function() {}),

      expect(req.autorouteQuery).to.deep.equal({
        $and: [
          {
            count: {
              $lt: 6,
            },
          }, {
            count: {
              $gt: 3,
            },
          },
      ],
      });
  });

  it('should return return status 200 when find is present for ids', function(done) {
    var chat = new Chat({
      name: 'unique person!!',
      count: 42,
    });
    chat.save(function(err, chatObj) {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find'),
      });

      request(global.app).get('/chats/' + chatObj._id).expect(200).expect(function(res) {
        expect(_.omit(res.body, '__v')).to.deep.equal({
          chats: {
            __v: 0,
            name: 'unique person!!',
            count: 42,
            _id: chatObj.id,
          },
        });
      })
      .end(done);
    });
  });

  it('should return a chats array and a meta array', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      logger: winston,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    winston.log('done loading');

    request(global.app).get('/chats?offset=0&limit=10').expect(200).expect(function(res) {
      expect(res.body).to.have.property('chats');
      expect(res.body).to.have.property('meta');
    })
    .end(done);
  });

  it('should have a chats array with a single item based on offset and limit', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    request(global.app).get('/chats?offset=0&limit=1').expect(200).expect(function(res) {
      expect(_.size(res.body)).to.equal(2);
      expect(_.size(res.body.chats)).to.equal(1);
    })
    .end(done);
  });

  // eslint-disable-next-line max-len
  it('should return a meta object with null previous object and a next pointing to the next item', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    request(global.app).get('/chats?offset=0&limit=1').expect(200).expect(function(res) {
      expect(_.size(res.body)).to.equal(2);
      expect(_.size(res.body.chats)).to.equal(1);
      expect(res.body.meta.previous).to.equal(null);
      expect(res.body.meta.next.offset).to.equal(1);
      expect(res.body.meta.next.limit).to.equal(1);
    })
    .end(done);
  });

  it('should return a chats array with five items based on offset and limit', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    request(global.app).get('/chats?offset=5&limit=5').expect(200).expect(function(res) {
      expect(_.size(res.body)).to.equal(2);
      expect(_.size(res.body.chats)).to.equal(5);
    })
    .end(done);
  });

  // eslint-disable-next-line max-len
  it('should return a meta object with a previous pointing to the previous item and a null next object', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    request(global.app).get('/chats?offset=5&limit=5').expect(200).expect(function(res) {
      expect(_.size(res.body)).to.equal(2);
      expect(_.size(res.body.chats)).to.equal(5);
      expect(res.body.meta.previous.offset).to.equal(0);
      expect(res.body.meta.previous.limit).to.equal(5);
      expect(res.body.meta.next).to.equal(null);
    })
    .end(done);
  });

  it('should return a meta object next and previous objects which should be null', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findPagination'),
    });

    request(global.app).get('/chats?offset=0&limit=20').expect(200).expect(function(res) {
      expect(_.size(res.body)).to.equal(2);
      expect(res.body.meta.previous).to.equal(null);
      expect(res.body.meta.next).to.equal(null);
    })
    .end(done);
  });
});
