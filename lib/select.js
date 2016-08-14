var _ = require('lodash');

module.exports = function(options) {
  return function(req, res, next) {
    if (options.find && options.find.select) {
      var fields = options.find.select(req);
      if (_.isArray(fields)) {
        fields = fields.join(' ');
      }
      _.assign(req, {
        autorouteSelect: fields,
      });
    }
    next();
  };
};
