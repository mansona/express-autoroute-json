var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    if (options && options.create) {
      _.assign(req, {
        // eslint-disable-next-line new-cap
        model: new options.model(req.body.data.attributes),
      });
    }
    next();
  };
};
