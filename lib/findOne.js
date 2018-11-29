const Promise = require('bluebird');
const _ = require('lodash');

var defaultSerialise = require('./serialise');

module.exports = options =>
  (req, res, next) => Promise.resolve(options.translateId
    ? options.translateId(req.params.id, req)
    : req.params.id)
    .then((id) => {
      const queryObject = req.autorouteQuery || {};

      if (options.idParameter || options.find.idParameter) {
        queryObject[options.idParameter || options.find.idParameter] = id;
      } else {
        queryObject._id = new options.model.base.Types.ObjectId(id);
      }

      const query = options.model.findOne(queryObject);

      if (options.find.populate) {
        query.populate(options.find.populate);
      }

      return query.exec();
    })
    .then(function(result) {
      if (!result) return res.status(404).send();

      return Promise.resolve(options.translateId
        ? _.assign(result.toJSON(), { id: req.params.id, originalId: result.id })
        : result)
        .then(function(translatedIdResult) {
          return options.find.processOne
            ? options.find.processOne(translatedIdResult, req)
            : translatedIdResult;
        })
        .then(function(processedResult) {
          const serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);

          return res.json(serialiseFunction(processedResult, options, defaultSerialise));
        });
    })
    .catch(function(err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return next(err);
    });
