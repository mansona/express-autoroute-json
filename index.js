var authorisationFunction = require('./lib/authorisation');
var executionFunction = require('./lib/execution');
var findOne = require('./lib/findOne');
var queryFunction = require('./lib/query');
var sortFunction = require('./lib/sort');

var identityMiddleware = require('./lib/identityMiddleware')

module.exports = function (options) {

    //check requied fields
    if (!options.model) throw new Error("Mongoose model is missing");

    //set the defaults
    var resource = options.resource || options.model.collection.name;
    var query = {};

    var outputJson = {};

    if (options.find) {
        outputJson.get = {};
        outputJson.get["/" + resource] = [
            options.find.authentication || identityMiddleware,
            authorisationFunction(options),
            queryFunction(options),
            sortFunction(options),
            executionFunction(options)
        ];
        outputJson.get["/" + resource + "/:id"] = [
            findOne(options)
        ];
    }

    if (options.debug) {
        console.log(outputJson);
    }

    return outputJson;
}