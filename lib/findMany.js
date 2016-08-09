var Q = require('q');
var _ = require('lodash');

var defaultSerialise = require('./serialise');

module.exports = function(options) {
  var isLean = options.find.lean ? options.find.lean : false;

  return function(req, res) {
    var query = options.model.find(req.autorouteQuery)
      .sort(req.autorouteSort)
      .select(req.autorouteSelect)
      .lean(isLean);

    query.exec().then(function(results) {
      if (options.find.process) {
        return Q(options.find.process(results, null, req));
      }
      return results;
    }).then(function(results) {
      var serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);

      res.json(serialiseFunction(results, options));
    });
  };
};
