var pluralize = require('pluralize');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var _ = require('lodash');

module.exports = function(data, options) {
  var type = pluralize(options.resource || options.model.collection.name);
  var keys = options.attributes || Object.keys(options.model.schema.paths);
  var attributes = _.reject(keys, function(key) {
    return key.indexOf('_') === 0;
  });

  var schema = {
    attributes: attributes,
    typeForAttribute: function (attribute) {
      var referenceType = _.get(options.model.schema.paths, `${attribute}.options.ref`);
      if (referenceType) {
        return _.lowerCase(pluralize(referenceType));
      }

      return attribute;
    },
  };

  attributes.forEach(function(attribute) {
    if (_.get(options.model.schema.paths, `${attribute}.options.ref`)) {
      schema[attribute] = {
        ref: function(object) {
          return object[attribute];
        },
      };
    }
  });

  var serializer = new JSONAPISerializer(type, schema);

  return serializer.serialize(data);
};
