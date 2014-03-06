module.exports = function (options) {

    //check requied fields
    if (!options.model) throw new Error("Mongoose model is missing");

    //set the defaults
    var resource = options.resource || options.model.collection.name;

    var outputJson = {};

    if (options.find) {
        outputJson.get = {};
        outputJson.get["/" + resource] = function (req, res) {
            options.model.find().exec().then(function(results){
                res.json(results);
            });
        };
        outputJson.get["/" + resource + "/:id"] = function (req, res) {
            res.send();
        };
    }


    if (options.debug) {
        console.log(outputJson);
    }

    return outputJson;
}