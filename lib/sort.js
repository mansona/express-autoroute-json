module.exports = function(options){
    return function(req, res, next){
        
        if(options.find && options.find.sort){
            req.autorouteSort = options.find.sort(req);
        }
        
        next();
    }
}