module.exports = function(options) {
    return function(req, res, next) {
        if (options && options.create) {
            console.log(req.body, options.resource || options.model.collection.name);
            req.model = new options.model(req.body[options.resource || options.model.collection.name]);
        }
        next();
    };
};
