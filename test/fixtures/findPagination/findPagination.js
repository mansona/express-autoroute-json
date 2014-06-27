var autorouteJson = require('../../../');
var Chats = require('../../models/chat');

module.exports.autoroute = autorouteJson({
    model: Chats,
    find: {
    	offset: function(req){
    		return req.query.offset || 0;
    	},
    	limit: function(req){
    		return req.query.limit || 100;
    	},
        process: function (results, meta) {
            return {
                chats: results,
                meta: meta
            }
        }
    }
})