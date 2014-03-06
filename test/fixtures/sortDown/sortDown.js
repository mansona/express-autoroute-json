var autorouteJson = require('../../../');
var Chats = require('../../models/chat');

module.exports.autoroute = autorouteJson({
    model: Chats,
    find: {
        sort: function (req, sort) {
            if (req.query.sortdown) {
                sort.count = -1;
            } else if (req.query.sortup) {
                sort.count = 1;
            }
        }
    }
})