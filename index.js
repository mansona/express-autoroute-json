var pluralize = require('pluralize');

var authorisationFunction = require('./lib/authorisation');
var createExecution = require('./lib/createExecution');
var createFunction = require('./lib/create');
var deleteOne = require('./lib/deleteOne');
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
            options.authentication || identityMiddleware,
            authorisationFunction(options),
            queryFunction(options),
            paginationFunction(options),
            sortFunction(options),
            selectFunction(options),
            findMany(options),
            error
        ];
        outputJson.get["/" + pluralize(resource) + "/:id"] = [
            options.authentication || identityMiddleware,
            authorisationFunction(options),
            findOne(options),
            error
        ];
    }
    if (options.create) {
        outputJson.post = {};
        outputJson.post["/" + pluralize(resource)] = [
            options.authentication || identityMiddleware,
            createFunction(options),
            createExecution(options),
            error
        ];
    }

    if (options.update) {
        outputJson.put = {};
        outputJson.put["/" + pluralize(resource) + "/:id"] = [
            options.authentication || identityMiddleware,
            authorisationFunction(options),
            updateOne(options),
            error
        ];
    }

    if (options.delete) {
        outputJson.delete = {};
        outputJson.delete["/" + pluralize(resource) + "/:id"] = [
            options.authentication || identityMiddleware,
            authorisationFunction(options),
            deleteOne(options),
            error
        ];
    }

    if (options.debug) {
        console.log(outputJson);
    }

    return outputJson;
};
