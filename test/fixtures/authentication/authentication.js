var autorouteJson = require('../../../');
var Chats = require('../../models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  find: {
    authentication: function(req, res, next) {
      // eh.. in case anyone sees this... don't EVER do authentication this way.
      // This is clearly an oversimplified authentication function for testing
      // purposes. That is all!
      if (req.query.userlevel === 'max') {
        return next();
      }

      return res.status(401).send();
    },
  },
});
