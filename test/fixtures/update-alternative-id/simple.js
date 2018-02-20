var autorouteJson = require('../../../');
var Project = require('../../models/project')();

module.exports.autoroute = autorouteJson({
  model: Project,
  resource: 'pear',
  translateId(id, req) {
    if (id === 'me') {
      return req.query.createdProject;
    }
    return id;
  },
  find: {},
  update: {},
});
