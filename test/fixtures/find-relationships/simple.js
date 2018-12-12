var autorouteJson = require('../../../');
var Person = require('../../models/person')();

module.exports.autoroute = autorouteJson({
  model: Person,
  find: {},
  allowInclude: ['spouse', 'pets'],
});
