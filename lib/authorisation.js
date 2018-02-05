var _ = require('lodash');

var mergeQueries = require('./helpers/mergeQueries');

module.exports = function(options, blockType) {
  return function(req, res, next) {
    let query;

    if (options && options[blockType] && options[blockType].authorisation) {
      query = options[blockType].authorisation(req);
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
