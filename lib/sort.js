var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    if (options.find && options.find.sort) {
      _.assign(req, {
        autorouteSort: options.find.sort(req),
      });
    }

    next();
  };
};
