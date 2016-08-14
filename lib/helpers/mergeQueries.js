var _ = require('lodash');

module.exports = function (first, second) {
  var commonKeys = _.intersection(first ? _.keys(first) : [], second ? _.keys(second) : []);

  var output = _.extend(_.omit(first || {}, commonKeys), _.omit(second || {}, commonKeys));

  _.each(commonKeys, function () {
    output.$and = [first, second];
  });
  return output;
};
