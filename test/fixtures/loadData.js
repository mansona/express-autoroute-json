//mock the mongoose
var mongoose = require('mongoose');
var mockgoose = require('mockgoose');
mockgoose(mongoose);

var Chat = require('../models/chat')();
var Q = require('q');

function init(){

    var promises = [1,2,3,4,5,6,7,8,9,10].map(function(i){
        var chat = new Chat({name: "person" + i , count: i});
        return Q.ninvoke(chat, 'save');
    });
    return Q.all(promises);
}

module.exports = {
    init: init,
    reset: function(){
        mockgoose.reset();
    }
};
