var authorisationFunction = require('./lib/authorisation');
var executionFunction = require('./lib/execution');
var findOne = require('./lib/findOne');
var queryFunction = require('./lib/query');
var sortFunction = require('./lib/sort');
var createFunction = require('./lib/create');
var paginationFunction = require('./lib/pagination');
var createExecution = require('./lib/createExecution');
var identityMiddleware = require('./lib/identityMiddleware');

module.exports = function (options) {

    //check required fields
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
            paginationFunction(options),
            sortFunction(options),
            executionFunction(options)
        ];
        outputJson.get["/" + resource + "/:id"] = [
            options.find.authentication || identityMiddleware,
            authorisationFunction(options),
            findOne(options)
        ];
    }
    if(options.create){
        outputJson.post = {};
        outputJson.post["/" + resource] = [
            createFunction(options),
            createExecution(options)
        ];
    }

    if (options.debug) {
        console.log(outputJson);
    }

    return outputJson;
};
