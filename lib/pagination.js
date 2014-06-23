module.exports = function(options){
    return function(req, res, next){
        if(options.find){
            if(options.find.offset){
                req.autorouteOffset = parseInt(options.find.offset(req));
            }
            
            if(options.find.limit){
                req.autorouteLimit = parseInt(options.find.limit(req));  
            }
        }
        next();
    }
}