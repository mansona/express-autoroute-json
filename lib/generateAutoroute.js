var pluralize = require('pluralize');
var _ = require('lodash');

var authorisationFunction = require('./authorisation');
var createExecution = require('./createExecution');
var createFunction = require('./create');
var deleteOne = require('./deleteOne');
var emptyMiddleware = require('./emptyMiddleware');
var error = require('./error');
var findMany = require('./findMany');
var findOne = require('./findOne');
var identityMiddleware = require('./identityMiddleware');
var queryFunction = require('./query');
var selectFunction = require('./select');
var sortFunction = require('./sort');
var updateOne = require('./updateOne');
var serialize = require('./serialise');

function exposeSerializer(options) {
  return function(req, res, next) {
    // eslint-disable-next-line no-param-reassign
    req.serialize = function(data) {
      return serialize(data, options);
    };
    next();
  };
}

module.exports = function(options) {
  // check required fields
  if (!options.model) {
    throw new Error('Mongoose model is missing');
  }

  // set the defaults
  var resource = options.resource || options.model.collection.name;
  var outputJson = {};

  if (options.find) {
    outputJson.get = {};
    outputJson.get['/' + pluralize(resource)] = [
      exposeSerializer(options),
      options.authentication || identityMiddleware,
      _.get(options, 'find.authentication', identityMiddleware),
      authorisationFunction(options, 'find'),

      options.preMiddleware || identityMiddleware,
      _.get(options, 'find.preMiddleware', identityMiddleware),
      queryFunction(options),
      sortFunction(options),
      selectFunction(options),
      findMany(options),
      error,
    ];

    outputJson.get['/' + pluralize(resource) + '/:id'] = [
      exposeSerializer(options),
      // global then local authentication
      options.authentication || identityMiddleware,
      _.get(options, 'find.authentication', identityMiddleware),
      authorisationFunction(options, 'find'),

      options.preMiddleware || identityMiddleware,
      _.get(options, 'find.preMiddleware', identityMiddleware),
      findOne(options),
      error,
    ];
  }

  if (options.create) {
    outputJson.post = {};
    outputJson.post['/' + pluralize(resource)] = [
      exposeSerializer(options),
      options.authentication || identityMiddleware,
      _.get(options, 'create.authentication', identityMiddleware),

      options.preMiddleware || identityMiddleware,
      _.get(options, 'create.preMiddleware', identityMiddleware),
      createFunction(options),
      createExecution(options),
      _.get(options, 'create.postMiddleware', emptyMiddleware),
      error,
    ];
  }

  if (options.update) {
    outputJson.patch = {};
    outputJson.patch['/' + pluralize(resource) + '/:id'] = [
      exposeSerializer(options),
      options.authentication || identityMiddleware,
      _.get(options, 'update.authentication', identityMiddleware),
      authorisationFunction(options, 'update'),

      options.preMiddleware || identityMiddleware,
      _.get(options, 'update.preMiddleware', identityMiddleware),
      updateOne(options),
      _.get(options, 'update.postMiddleware', emptyMiddleware),
      error,
    ];
  }

  if (options.delete) {
    outputJson.delete = {};
    outputJson.delete['/' + pluralize(resource) + '/:id'] = [
      exposeSerializer(options),
      options.authentication || identityMiddleware,
      _.get(options, 'delete.authentication', identityMiddleware),
      authorisationFunction(options, 'delete'),

      options.preMiddleware || identityMiddleware,
      _.get(options, 'delete.preMiddleware', identityMiddleware),
      deleteOne(options),
      _.get(options, 'delete.postMiddleware', emptyMiddleware),
    ];
  }

  return outputJson;
};
