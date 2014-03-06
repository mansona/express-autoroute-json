module.exports = function (options) {
    return function (req, res, next) {
        if (options && options.find && options.find.query) {
            //create if doesn't exist
            if (!req.autorouteQuery) req.autorouteQuery = {}

            options.find.query.call(this, req, req.autorouteQuery);
        }
        next();
    }
}