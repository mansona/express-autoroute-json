module.exports = require('mongoose').model('Chat', require('mongoose').Schema({
    name: String,
    count: Number
}));