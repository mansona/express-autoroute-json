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
      var doc = Array.isArray(data) ? data[0] : data;
      var ref = Array.isArray(doc[attribute]) ? doc[attribute][0] : doc[attribute];

      // Figure out if our reference object is an ObjectID or a resource.
      // eslint-disable-next-line no-underscore-dangle
      if (!ref || _.get(ref, '_bsontype') === 'ObjectID') {
        // This is an unloaded relationship.
        schema[attribute] = {
          ref: true,
        };
      } else {
        // The relationship properties should be included
        schema[attribute] = {
          ref: 'id',
          attributes: Object.keys(ref.toJSON()).filter(key => !/^_/g.test(key)),
        };
      }
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
