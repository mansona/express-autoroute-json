var autorouteJson = require('../../../');
var Chats = require('../../models/chat');

module.exports.autoroute = autorouteJson({
    model: Chats,
    find: {
        authorisation: function (req) {
            // eh.. in case anyone sees this... don't EVER do authorisation this way.
            // This is clearly an oversimplified authorisation function for testing purposes. That is all!
            if (req.query.userlevel) {
                // only see chats up to your level NOOB
                return {
                    count: {
                        "$lt": req.query.userlevel
                    }
                };
            }
        },
        query: function (req) {
            if (req.query.min) {
                return {
                    count: {
                        "$gt": req.query.min
                    }
                };
            }
        }
    }
})