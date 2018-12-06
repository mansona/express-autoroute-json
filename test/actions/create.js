var autoroute = require('express-autoroute');
var { expect } = require('chai');
var bodyParser = require('body-parser');

var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');

var Project = require('../models/project')();

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
        expect(res.body).to.have.nested.property('data.id');
        expect(res.body).to.have.nested.property('data.attributes.name', 'name');
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
            expect(getResponse.body.data).to.have.nested.property('attributes.name', 'name');
          })
          .end(global.jsonAPIVerify(done));
      });
  });

  it('should read dasherized attributes on the request body', function(done) {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'createProjects'),
    });

    request(global.app)
      .post('/projects')
      .type('application/json')
      .send({
        data: {
          type: 'projects',
          attributes: {
            title: 'face',
            description: 'facey face',
            'project-start': '2016-08-18T23:00:00.000Z',
            'project-end': '2016-08-30T23:00:00.000Z',
            tags: ['one-tag', 'two-tag', 'three-tag', 'face'],
            'is-active': false,
          },
        },
      })
      .expect(201)
      .end(function(err, res) {
        expect(err).to.not.be.ok;

        Project.findOne({
          _id: res.body.data.id,
        }).then(function(project) {
          expect(project).to.have.property('title', 'face');
          expect(project).to.have.property('description', 'facey face');
          expect(project).to.have.property('projectStart');
          expect(project.projectStart.getTime())
            .to.equal(new Date('2016-08-18T23:00:00.000Z').getTime());
          expect(project).to.have.property('projectEnd');
          expect(project.projectEnd.getTime())
            .to.equal(new Date('2016-08-30T23:00:00.000Z').getTime());
          expect(project).to.have.property('tags');
          expect(project).to.have.property('isActive', false);
        })
          .then(done, done);
      });
  });
});
