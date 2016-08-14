var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
});
