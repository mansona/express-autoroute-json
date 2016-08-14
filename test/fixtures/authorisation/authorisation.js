var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    authorisation: function() {
      // only see chats up to your level NOOB
      return {
        count: {
          $lt: 6,
        },
      };
    },

    query: function(req) {
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
