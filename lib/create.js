module.exports = function (options) {
    return function (req, res, next) {
        if (options && options.create) {

            req.model = new options.model(req.body);

        }
        next();
    }
};