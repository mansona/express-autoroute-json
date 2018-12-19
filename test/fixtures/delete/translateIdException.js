var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  resource: 'discussion',
  translateId() {
    throw new Error('I cant let you do that dave');
  },
  find: {},
  delete: {},
});
