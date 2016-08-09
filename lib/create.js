var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');

module.exports = function(options) {
  return function(req, res, next) {
    if (options && options.create) {
      _.assign(req, {
        // eslint-disable-next-line new-cap
        model: new options.model(camelcaseKeys(req.body.data.attributes)),
      });
    }
    next();
  };
};
