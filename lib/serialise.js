var pluralize = require('pluralize');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var _ = require('lodash');

module.exports = function(data, options) {
  var type = pluralize(options.resource || options.model.collection.name);
  var keys = options.attributes || Object.keys(options.model.schema.paths);
  var attributes = _.filter(keys, function(key) {
    return key.indexOf('_') !== 0;
  });

  var serializer = new JSONAPISerializer(type, {
    attributes: attributes,
  });

  return serializer.serialize(data);
};
