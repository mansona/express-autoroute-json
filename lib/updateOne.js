var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');
var Q = require('q');

var defaultSerialise = require('./serialise');
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

      var newModel = {};

      if (req.body.data.attributes) {
        _.assign(newModel, camelcaseKeys(req.body.data.attributes));
      }

      _.forEach(req.body.data.relationships, function(value, key) {
        if (value.data && value.data.id) {
          newModel[key] = value.data.id;
        }
        // delete relationship
        if (value.data === null) {
          newModel[key] = null;
        }
        // array relationship
        if (Array.isArray(value.data)) {
          newModel[key] = _.chain(value.data)
            .map('id')
            .compact()
            .value();
        }
      });

      return options.model.findOneAndUpdate(query, {
        $set: newModel,
      }, {
        new: true,
      }).then(function(updated) {
        if (!updated) {
          throw new Error('NotFound');
        }
        return updated;
      });
    })

    .then(function(result) {
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

    .then(function() {
      next();
    })

    .then(null, function(err) {
      if ((err.name === 'CastError' && err.kind === 'ObjectId') || err.message === 'NotFound') {
        // could not cast the ID
        res.status(404).send({
          errors: [{
            detail: 'Not Found',
          }],
        });
      } else {
        next(err);
      }
    });
  };
};
