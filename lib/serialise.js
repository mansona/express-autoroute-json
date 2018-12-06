var pluralize = require('pluralize');
var JSONAPISerializer = require('jsonapi-serializer').Serializer;
var _ = require('lodash');

module.exports = function(data, options) {
  var type = pluralize(options.resource || options.model.collection.name);
  var keys = options.attributes || Object.keys(options.model.schema.paths);
  var attributes = _.reject(keys, function(key) {
    return key.indexOf('_') === 0;
  });

  if (options.translateId) {
    attributes.push('originalId');
  }

  var schema = {
    attributes: attributes,
    typeForAttribute: function (attribute) {
      var attributeOptions = _.get(options.model.schema.paths, attribute + '.options');
      var referenceType = _.get(attributeOptions, 'ref') || _.get(attributeOptions, 'type.0.ref');
      if (referenceType) {
        return _.lowerCase(pluralize(referenceType));
      }

      if (options.selfReferences && options.selfReferences[attribute]) {
        return options.selfReferences[attribute];
      }

      return attribute;
    },
  };

  attributes.forEach(function(attribute) {
    var attributeOptions = _.get(options.model.schema.paths, attribute + '.options');
    if (_.get(attributeOptions, 'ref') || _.get(attributeOptions, 'type.0.ref')) {
      schema[attribute] = {
        ref: true,
      };
    }
  });

  // add self-reference relationships i.e. the relationship's id is the same as the object id
  if (options.selfReferences) {
    Object.keys(options.selfReferences).forEach(function(key) {
      schema.attributes.push(key);

      if (Array.isArray(data)) {
        data.forEach(item => _.assign(item, { [key]: '****' }));
      } else {
        _.assign(data, { [key]: '****' });
      }

      schema[key] = {
        ref: function(object) {
          return object._id;
        },
      };
    });
  }

  var serializer = new JSONAPISerializer(type, schema);

  return serializer.serialize(data);
};
