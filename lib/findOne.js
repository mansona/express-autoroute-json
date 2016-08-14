var Q = require('q');
var _ = require('lodash');

var defaultSerialise = require('./serialise');

module.exports = function(options) {
  return function(req, res, next) {
    Q.fcall(function() {
      if (options.translateId) {
        return options.translateId(req.params.id, req);
      }

      return req.params.id;
    })

    .then(function(id) {
      var queryObject = req.autorouteQuery || {};

      queryObject[options.idParameter || options.find.idParameter || '_id'] = id;

      var query = options.model.findOne(queryObject);

      if (options.find.populate) {
        query.populate(options.find.populate);
      }

      return query.exec();
    })

    .then(function(result) {
      if (!result) {
        return res.status(404).send();
      }

      return Q.fcall(function() {
        if (options.find.processOne) {
          return Q(options.find.processOne(result, req));
        }

        return result;
      }).then(function(processedResult) {
        var serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);

        res.json(serialiseFunction(processedResult, options));
      });
    })

    .then(null, function(err) {
      return next(err);
    });
  };
};
