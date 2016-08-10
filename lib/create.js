var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');

module.exports = function(options) {
  return function(req, res, next) {
    if (options && options.create) {
      var newModel = camelcaseKeys(req.body.data.attributes);

      _.forEach(req.body.data.relationships, function(value, key) {
        newModel[key] = value.data;
      });

      _.assign(req, {
        // eslint-disable-next-line new-cap
        model: new options.model(newModel),
      });
    }
    next();
  };
};
