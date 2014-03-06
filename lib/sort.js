module.exports = function(options){
    return function(req, res, next){
        
        if(!req.autorouteSort) req.autorouteSort = {};
        
        if(options.find && options.find.sort){
            options.find.sort.call(this, req, req.autorouteSort);
        }
        
        next();
    }
}