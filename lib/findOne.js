const _ = require('lodash');

var defaultSerialise = require('./serialise');

module.exports = function(options) {
  return function(req, res, next) {
    return new Promise(function(resolve) {
      if (options.translateId) {
        return resolve(options.translateId(req.params.id, req));
      }

      return resolve(req.params.id);
    })

      .then(function(id) {
        var queryObject = req.autorouteQuery || {};

        if (options.idParameter || options.find.idParameter) {
          queryObject[options.idParameter || options.find.idParameter] = id;
        } else {
          queryObject._id = new options.model.base.Types.ObjectId(id);
        }

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

        return new Promise(function(resolve) {
          if (options.translateId) {
            // reverse translate id
            return resolve(_.assign(result.toJSON(), { id: req.params.id, originalId: result.id }));
          }

          return resolve(result);
        }).then((translatedIdResult) => {
          if (options.find.processOne) {
            return Promise.resolve(options.find.processOne(translatedIdResult, req));
          }

          return translatedIdResult;
        }).then(function(processedResult) {
          var serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);

          res.json(serialiseFunction(processedResult, options, defaultSerialise));
        });
      })

      .then(null, function(err) {
        // eslint-disable-next-line no-console
        console.log(err);
        return next(err);
      });
  };
};
