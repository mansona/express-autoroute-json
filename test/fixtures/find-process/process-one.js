var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  resource: 'apple',
  find: {
    processOne(result) {
      // eslint-disable-next-line no-param-reassign
      result.name = 'person1 processed once';
      return result;
    },
  },
});
