var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');

module.exports = function(options) {
  return function(req, res, next) {
    if (options && options.create) {
      var newModel = camelcaseKeys(req.body.data.attributes);
      var relationships = req.body.data.relationships;

      if (!_.isEmpty(relationships)) {
        relationships = camelcaseKeys(req.body.data.relationships);
      }

      _.forEach(relationships, function(value, key) {
        if (value.data && value.data.id) {
          newModel[key] = value.data.id;
        }
      });

      _.assign(req, {
        // eslint-disable-next-line new-cap
        model: new options.model(newModel),
      });
    }
    next();
  };
};
