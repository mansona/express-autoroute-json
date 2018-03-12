var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    query: function(req) {
      // have a min chat length
      return { count: { $gt: req.query.min } };
    },
  },
});
