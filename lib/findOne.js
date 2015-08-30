var Q = require('q');

module.exports = function(options) {
    return function(req, res, next) {

        Q.fcall(function() {

            if (options.translateId) {
                return options.translateId(req.params.id, req);
            }

            return req.params.id;
        })

        .then(function(id) {
            var query = options.model.findOne({
                _id: id
            });

            if (options.find.populate) {
                query.populate(options.find.populate);
            }

            return query.exec();
        })

        .then(function (result) {
        	if(options.find.processOne){
                return res.json(options.find.processOne(result, req));
            }
            var resultJson ={};
            resultJson[options.resource || options.model.collection.name] = result;
            res.json(resultJson);
        })

        .then(null, function(err) {
            return next(err);
        });
    };
};
