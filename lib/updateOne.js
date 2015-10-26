var Q = require('q');

var mergeQueries = require('./helpers/mergeQueries');

module.exports = function(options) {
    return function(req, res, next) {

        Q.fcall(function() {
            if (options.translateId) {
                return options.translateId(req.params.id, req);
            }

            return req.params.id;
        })

        .then(function(id) {
            var query = {};

            query[options.idParameter || options.update.idParameter || '_id'] = id;

            if (req.autorouteQuery) {
                query = mergeQueries(req.autorouteQuery, query);
            }

            return options.model.update(query, req.body[options.resource || options.model.collection.name]).exec();
        })

        .then(function() {
            res.status(204).send();
            next();
        })

        .then(null, function(err) {
            return next(err);
        });
    };
};
