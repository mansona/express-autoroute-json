var autorouteJson = require('../../../');
var Chats = require('../../models/chats');

module.exports.autoroute = autorouteJson({
    model: Chats,
    find: {},
    update: {}, //all default
    create: {} //all default
})