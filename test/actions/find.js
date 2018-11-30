var _ = require('lodash');
var autoroute = require('express-autoroute');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');

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

    request(global.app)
      .get('/chats')
      .expect(200)
      .end(global.jsonAPIVerify(done));
  });

  it('should return 404 when there is no find object', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'modelOnly'),
    });

    request(global.app)
      .get('/chats')
      .expect(404)
      .end(done);
  });

  it('should return return all models when find is present', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find'),
    });

    request(global.app).get('/chats').expect(200).expect(function(res) {
      expect(_.size(res.body.data)).to.equal(10);
    })
      .end(global.jsonAPIVerify(done));
  });

  it('should return only return models that fit the query', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'findQuery'),
    });

    request(global.app).get('/chats?min=3').expect(200).expect(function(res) {
      expect(_.size(res.body.data)).to.equal(7);
    })
      .end(global.jsonAPIVerify(done));
  });

  it('should return a sorted array of objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'sortDown'),
    });

    request(global.app).get('/chats?sortup=true').expect(200).expect(function(res) {
      var expected = _.sortBy(res.body.data, function(item) {
        return item.attributes.count;
      });
      expect(res.body.data).to.deep.equal(expected);
    })
      .end(global.jsonAPIVerify(done));
  });

  it('should return a reverse sorted array of objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'sortDown'),
    });

    request(global.app).get('/chats?sortdown=true').expect(200).expect(function(res) {
      var expected = _.sortBy(res.body.data, function(item) {
        return 1 - item.attributes.count;
      });

      expect(res.body.data).to.deep.equal(expected);
    })
      .end(global.jsonAPIVerify(done));
  });

  it('should allow authenticated users to get objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authentication'),
    });

    request(global.app).get('/chats?userlevel=max').expect(200).expect(function(res) {
      expect(_.size(res.body.data)).to.equal(10);
    })
      .end(global.jsonAPIVerify(done));
  });

  it('should not allow authenticated users to get objects', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authentication'),
    });

    request(global.app)
      .get('/chats?userlevel=noob')
      .expect(401)
      .end(done);
  });

  it('should only allow me to see the number of users i am allowed to see', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    request(global.app)
      .get('/chats')
      .expect(function(res) {
        expect(_.size(res.body.data)).to.equal(5);
      })
      .end(global.jsonAPIVerify(done));
  });

  it('should combine authorisation and query correctly', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'authorisation'),
    });

    request(global.app)
      .get('/chats?min=3')
      .expect(function(res) {
        expect(_.size(res.body.data)).to.equal(2);
      })
      .end(global.jsonAPIVerify(done));
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

    request(global.app).get('/chats?min=3')
      .expect(function(res) {
        expect(_.size(res.body.data)).to.equal(2);
      })
      .end(global.jsonAPIVerify(done));
  });

  // TODO convert this to a real test now that we've removed mockgoose
  it.skip('should build an $and query when there are competing restrictions', function() {
    var options = {
      // eslint-disable-next-line global-require
      model: require('../models/chat')(),
      find: {
        // eslint-disable-next-line consistent-return
        authorisation: function(req) {
          if (req.query.userlevel) {
            return {
              count: {
                $lt: req.query.userlevel,
              },
            };
          }
        },

        // eslint-disable-next-line consistent-return
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

    authorisationFunction(options, 'find')(req, {}, function() {});

    queryFunction(options)(req, {}, function() {});

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

      request(global.app)
        .get('/chats/' + chatObj._id)
        .expect(200)
        .expect(function(res) {
          expect(_.omit(res.body, '__v')).to.deep.equal({
            data: {
              type: 'chats',
              id: chatObj.id,
              attributes: {
                name: 'unique person!!',
                count: 42,
              },
            },
          });
        })
        .end(global.jsonAPIVerify(done));
    });
  });

  it('should be able to change the name of the resource', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-resource'),
    });

    request(global.app)
      .get('/monkeys')
      .expect(200)
      .end(global.jsonAPIVerify(done));
  });

  describe('- selfReferences -', function() {
    it('should add the objectId as a selfReference relationship when querying multiple using deprecated syntax', function(done) {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-selfReference'),
      });

      request(global.app)
        .get('/chats')
        .expect(200)
        .expect(function(res) {
          res.body.data.forEach((item) => {
            expect(item.relationships).to.have.property('face');
            expect(item.relationships.face).to.deep.equal({ data: { type: 'mySuperType', id: item.id } });
          });
        })
        .end(global.jsonAPIVerify(done));
    });

    it('should add the objectId as a selfReference relationship when querying one using deprecated syntax', function(done) {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-selfReference'),
      });

      request(global.app)
        .get(`/chats/${fixture.data.chats[0]._id}`)
        .expect(200)
        .expect(function(res) {
          expect(res.body.data.relationships).to.have.property('face');
          expect(res.body.data.relationships.face).to.deep.equal({ data: { type: 'mySuperType', id: res.body.data.id } });
        })
        .end(global.jsonAPIVerify(done));
    });
  });

  describe('- the process fuction -', function() {
    it('should processs multiple objects', function(done) {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-process'),
      });

      request(global.app)
        .get('/chats')
        .expect(200)
        .expect(function(res) {
          expect(_.omit(res.body.data[0], 'id')).to.deep.equal({
            type: 'chats',
            attributes: {
              name: `person${res.body.data[0].attributes.count} processed`,
              count: res.body.data[0].attributes.count,
            },
          });
        })
        .end(global.jsonAPIVerify(done));
    });

    it('should processs single objects', function(done) {
      autoroute(global.app, {
        throwErrors: true,
        routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-process'),
      });

      Chat.create({
        name: 'should processs single objects',
        count: 88127,
      }).then((chat) => {
        request(global.app)
          .get(`/apples/${chat._id}`)
          .expect(200)
          .expect(function(res) {
            expect(_.omit(res.body.data, 'id')).to.deep.equal({
              type: 'apples',
              attributes: {
                name: 'person1 processed once',
                count: 88127,
              },
            });
          })
          .end(global.jsonAPIVerify(done));
      });
    });
  });
});
