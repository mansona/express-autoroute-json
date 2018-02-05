var autorouteJson = rootRequire('./');
var Chats = rootRequire('test/models/chat')();

module.exports.autoroute = autorouteJson({
  model: Chats,
  resource: 'scenarios-authorisation-delete-chat',
  find: {},
  create: {},
  update: {},
  delete: {
    authorisation: function() {
      // only see chats with a count less than 6 - i.e. find short chats
      return {
        count: {
          $lte: 6,
        },
      };
    },
  },
});
