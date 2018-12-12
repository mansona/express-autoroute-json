const _ = require('lodash');

var defaultSerialise = require('./serialise');
var parseInclude = require('./parseInclude');

module.exports = function(options) {
  return function(req, res, next) {
    var id = options.translateId ? options.translateId(req.params.id, req) : req.params.id;
    var relInclude = parseInclude(req, options);
    var queryObject = req.autorouteQuery || {};

    if (options.idParameter || options.find.idParameter) {
      queryObject[options.idParameter || options.find.idParameter] = id;
    } else {
      queryObject._id = new options.model.base.Types.ObjectId(id);
    }

    var query = relInclude.reduce(
      (findOne, rel) => findOne.populate(rel), options.model.findOne(queryObject)
    );

    return query.exec()
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
