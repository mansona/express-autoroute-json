module.exports = function(options){
    return function(req, res, next){
        if(options.find){
            req.autorouteOptions = {};
            if(options.find.offset){
                req.autorouteOptions.skip = parseInt(options.find.offset(req));
            }
            
            if(options.find.limit){
                req.autorouteOptions.limit = parseInt(options.find.limit(req));  
            }
        }
        next();
    }
}