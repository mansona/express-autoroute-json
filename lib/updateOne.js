var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');

var defaultSerialise = require('./serialise');
var mergeQueries = require('./helpers/mergeQueries');

module.exports = function(options) {
  return function(req, res, next) {
    return new Promise(function(resolve) {
      if (options.translateId) {
        return resolve(options.translateId(req.params.id, req));
      }

      return resolve(req.params.id);
    }).then(function(id) {
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
          newModel[_.camelCase(key)] = value.data.id;
        }
        // delete relationship
        if (value.data === null) {
          newModel[_.camelCase(key)] = null;
        }
        // array relationship
        if (Array.isArray(value.data)) {
          newModel[_.camelCase(key)] = _.chain(value.data)
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

        req.model = updated;

        return new Promise(function(resolve) {
          if (options.translateId) {
            // reverse translate id
            return resolve(
              _.assign(updated.toJSON(), { id: req.params.id, originalId: updated.id })
            );
          }

          return resolve(updated);
        });
      });
    }).then(function(result) {
      return new Promise(function(resolve) {
        if (options.find.processOne) {
          return resolve(options.find.processOne(result, req));
        }

        return resolve(result);
      }).then(function(processedResult) {
        var serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);

        res.json(serialiseFunction(processedResult, options, defaultSerialise));
      });
    }).then(function() {
      next();
    })
      .catch(function(err) {
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
