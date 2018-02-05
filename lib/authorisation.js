var _ = require('lodash');

var mergeQueries = require('./helpers/mergeQueries');

module.exports = function(options) {
  return function(req, res, next) {
    let query;

    if (options && options.find && options.find.authorisation) {
      query = options.find.authorisation(req);
    } else if (options && options.authorisation) {
      query = options.authorisation(req);
    }

    if (query) {
      _.assign(req, {
        autorouteQuery: mergeQueries(req.autorouteQuery, query),
      });
    }

    next();
  };
};
