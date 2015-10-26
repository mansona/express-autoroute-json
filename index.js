var pluralize = require('pluralize');
var _ = require('lodash');

var authorisationFunction = require('./lib/authorisation');
var createExecution = require('./lib/createExecution');
var createFunction = require('./lib/create');
var deleteOne = require('./lib/deleteOne');
var emptyMiddleware = require('./lib/emptyMiddleware');
var error = require('./lib/error');
var findMany= require('./lib/findMany');
var findOne = require('./lib/findOne');
var identityMiddleware = require('./lib/identityMiddleware');
var paginationFunction = require('./lib/pagination');
var queryFunction = require('./lib/query');
var selectFunction = require('./lib/select');
var sortFunction = require('./lib/sort');
var updateOne = require('./lib/updateOne');

module.exports = function(options) {

    //check required fields
    if (!options.model) {
        throw new Error("Mongoose model is missing");
    }

    //set the defaults
    var resource = options.resource || options.model.collection.name;

    var outputJson = {};

    if (options.find) {
        outputJson.get = {};
        outputJson.get["/" + pluralize(resource)] = [
            options.preMiddleware || identityMiddleware,
            options.authentication || identityMiddleware,
            _.get(options, 'find.authentication', identityMiddleware),
            authorisationFunction(options),
            queryFunction(options),
            paginationFunction(options),
            sortFunction(options),
            selectFunction(options),
            findMany(options),
            error
        ];
        outputJson.get["/" + pluralize(resource) + "/:id"] = [
            options.preMiddleware || identityMiddleware,
            options.authentication || identityMiddleware,
            _.get(options, 'find.authentication', identityMiddleware),
            authorisationFunction(options),
            findOne(options),
            error
        ];
    }
    if (options.create) {
        outputJson.post = {};
        outputJson.post["/" + pluralize(resource)] = [
            options.preMiddleware || identityMiddleware,
            options.authentication || identityMiddleware,
            _.get(options, 'create.authentication', identityMiddleware),
            createFunction(options),
            createExecution(options),
            _.get(options, 'create.postMiddleware', emptyMiddleware),
            error
        ];
    }

    if (options.update) {
        outputJson.put = {};
        outputJson.put["/" + pluralize(resource) + "/:id"] = [
            options.preMiddleware || identityMiddleware,
            options.authentication || identityMiddleware,
            _.get(options, 'update.authentication', identityMiddleware),
            authorisationFunction(options),
            updateOne(options),
            _.get(options, 'update.postMiddleware', emptyMiddleware),
            error
        ];
    }

    if (options.delete) {
        outputJson.delete = {};
        outputJson.delete["/" + pluralize(resource) + "/:id"] = [
            options.preMiddleware || identityMiddleware,
            options.authentication || identityMiddleware,
            _.get(options, 'delete.authentication', identityMiddleware),
            authorisationFunction(options),
            deleteOne(options),
            _.get(options, 'delete.postMiddleware', emptyMiddleware),
            error
        ];
    }

    if (options.debug) {
        console.log(outputJson);
    }

    return outputJson;
};
