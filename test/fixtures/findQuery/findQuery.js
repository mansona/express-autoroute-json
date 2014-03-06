var autorouteJson = require('../../../');
var Chats = require('../../models/chat');

module.exports.autoroute = autorouteJson({
    model: Chats,
    find: {
        query: function(req, query){
            //have a min chat length
            query.count = { "$gt" : req.query.min };
        }
    }
})