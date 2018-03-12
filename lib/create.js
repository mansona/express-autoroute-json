var _ = require('lodash');
var camelcaseKeys = require('camelcase-keys');

module.exports = function(options) {
  return function(req, res, next) {
    if (options && options.create) {
      var newModel = camelcaseKeys(req.body.data.attributes);

      if (!_.isEmpty(req.body.data.relationships)) {
        _.forEach(
          camelcaseKeys(req.body.data.relationships),
          function(value, key) {
            // simple relationship
            if (value.data && value.data.id) {
              newModel[key] = value.data.id;
            }

            // array relationship
            if (Array.isArray(value.data)) {
              newModel[key] = _.chain(value.data)
                .map('id')
                .compact()
                .value();
            }
          }
        );
      }

      _.assign(req, {
        // eslint-disable-next-line new-cap
        model: new options.model(newModel),
      });
    }
    next();
  };
};
