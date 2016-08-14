var autorouteJson = require('../../../');
var Project = require('../../models/project')();

module.exports.autoroute = autorouteJson({
  model: Project,

  find: {},
  update: {},
});
