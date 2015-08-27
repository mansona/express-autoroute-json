var mergeQueries = require('./helpers/mergeQueries');

module.exports = function (options) {
    return function (req, res, next) {

        var id = req.params.id;

        if(options.translateId){
            id = options.translateId(id, req);
        }

        var query = {
            _id: id
        };

        if(req.autorouteQuery){
             query = mergeQueries(req.autorouteQuery, query);
        }

        options.model.update(query, req.body[options.resource || options.model.collection.name]).exec().then(function () {
        	res.status(204).send();

            next();
        })
        .then(null, function(err){
            return next(err);
        });
    };
};
