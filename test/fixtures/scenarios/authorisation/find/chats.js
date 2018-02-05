var autorouteJson = rootRequire('./');
var Chats = rootRequire('test/models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  resource: 'scenarios-authorisation-find-chat',
  find: {
    authorisation: function() {
      // only see chats with a count less than 6 - i.e. find short chats
      return {
        count: {
          $lte: 6,
        },
      };
    },
  },
  create: {},
  update: {},
  delete: {},
});
