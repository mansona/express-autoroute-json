var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    process(results) {
      results.forEach((result) => {
        // eslint-disable-next-line no-param-reassign
        result.name += ' processed';
      });
      return results;
    },
  },
});
