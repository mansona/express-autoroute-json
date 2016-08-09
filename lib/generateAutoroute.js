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
var paginationFunction = require('./pagination');
var queryFunction = require('./query');
var selectFunction = require('./select');
var sortFunction = require('./sort');
var updateOne = require('./updateOne');

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
      options.preMiddleware || identityMiddleware,
      _.get(options, 'find.preMiddleware', identityMiddleware),
      options.authentication || identityMiddleware,
      _.get(options, 'find.authentication', identityMiddleware),
      authorisationFunction(options),
      queryFunction(options),
      paginationFunction(options),
      sortFunction(options),
      selectFunction(options),
      findMany(options),
      error,
    ];

    outputJson.get['/' + pluralize(resource) + '/:id'] = [
      options.preMiddleware || identityMiddleware,
      _.get(options, 'find.preMiddleware', identityMiddleware),
      options.authentication || identityMiddleware,
      _.get(options, 'find.authentication', identityMiddleware),
      authorisationFunction(options),
      findOne(options),
      error,
    ];
  }

  if (options.create) {
    outputJson.post = {};
    outputJson.post['/' + pluralize(resource)] = [
      options.preMiddleware || identityMiddleware,
      _.get(options, 'create.preMiddleware', identityMiddleware),
      options.authentication || identityMiddleware,
      _.get(options, 'create.authentication', identityMiddleware),
      createFunction(options),
      createExecution(options),
      _.get(options, 'create.postMiddleware', emptyMiddleware),
      error,
    ];
  }

  if (options.update) {
    outputJson.put = {};
    outputJson.put['/' + pluralize(resource) + '/:id'] = [
      options.preMiddleware || identityMiddleware,
      _.get(options, 'update.preMiddleware', identityMiddleware),
      options.authentication || identityMiddleware,
      _.get(options, 'update.authentication', identityMiddleware),
      authorisationFunction(options),
      updateOne(options),
      _.get(options, 'update.postMiddleware', emptyMiddleware),
      error,
    ];
  }

  if (options.delete) {
    outputJson.delete = {};
    outputJson.delete['/' + pluralize(resource) + '/:id'] = [
      options.preMiddleware || identityMiddleware,
      _.get(options, 'delete.preMiddleware', identityMiddleware),
      options.authentication || identityMiddleware,
      _.get(options, 'delete.authentication', identityMiddleware),
      authorisationFunction(options),
      deleteOne(options),
      _.get(options, 'delete.postMiddleware', emptyMiddleware),
      error,
    ];
  }

  return outputJson;
};