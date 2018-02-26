var autoroute = require('express-autoroute');
var { expect } = require('chai');
var path = require('path');
var request = require('supertest');

var fixture = require('../fixtures/loadData');
var Project = require('../models/project')();

describe('the find block with translateId', function() {
  beforeEach(function() {
    // reset app
    return fixture.init();
  });

  afterEach(function() {
    return fixture.reset();
  });

  it('should allow for a "me" route implementation', () => {
    autoroute(global.app, {
      throwErrors: true,
      routesDir: path.join(process.cwd(), 'test', 'fixtures', 'find-alternative-id'),
    });

    return Project.create({
      title: 'This is my project!!!',
      description: 'in the find-alternative-id test',
    }).then((project) => {
      return request(global.app)
        .get(`/pears/me?createdProject=${project.id}`)
        .expect(200)
        .then((response) => {
          global.validateJSONAPI(response);
          expect(response.body.data).to.deep.equal({
            type: 'pears',
            attributes: {
              title: 'This is my project!!!',
              description: 'in the find-alternative-id test',
              tags: [],
              'original-id': project.id,
            },
            id: 'me',
          });
        });
    });
  });
});
