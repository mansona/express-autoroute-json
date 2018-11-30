var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    // eslint-disable-next-line consistent-return
    sort: function (req) {
      if (req.query.sortdown) {
        return {
          count: -1,
        };
      }

      if (req.query.sortup) {
        return {
          count: 1,
        };
      }
    },
  },
});
