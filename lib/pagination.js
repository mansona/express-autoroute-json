module.exports = function(options){
    return function(req, res, next){
        if(options.find){
            if(options.find.limit){//Only enforce an offset if a limit has been given
                req.autorouteLimit = parseInt(options.find.limit(req));
                if(options.find.offset){
                    req.autorouteOffset = parseInt(options.find.offset(req));
                }
                else{
                    req.autorouteOffset = 0;
                }
            }
        }
        next();
    }
}