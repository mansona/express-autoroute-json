var Chat = require('../models/chat');
var Q = require('q');

module.exports = function(callback){
    
    var promises = [1,2,3,4,5,6,7,8,9,10].map(function(i){
        var chat = new Chat({name: "person" + i , count: i});
        return Q.ninvoke(chat, 'save')
    })
    Q.all(promises).then(function(){
        callback();
    }, function(err){
        throw err;
    })
}