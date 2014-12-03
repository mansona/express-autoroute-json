var util = require('util');

module.exports = function(options){
    return function(req, res, next){
        
        if(options.find && options.find.select){
            var fields = options.find.select(req);

            if (util.isArray(fields)) {
              fields = fields.join(' ');
            }

            req.autorouteSelect = fields;
        }
        
        next();
    }
}