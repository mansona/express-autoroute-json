var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  resource: 'conversation',
  translateId(id, req) {
    return req.query.id;
  },
  find: {},
  delete: {},
});
