var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    authorisation: function() {
      // only see chats with a count less than 6 - i.e. find short chats
      return {
        count: {
          $lt: 6,
        },
      };
    },

    // eslint-disable-next-line consistent-return
    query(req) {
      if (req.query.min) {
        return {
          count: {
            $gt: req.query.min,
          },
        };
      }
    },
  },
});
