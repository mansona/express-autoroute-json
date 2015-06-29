module.exports = function (options) {
    return function (req, res) {

        var id = req.params.id;

        if(options.find.translateId){
            id = options.find.translateId(id, req);
        }

        var query = options.model.findOne({
            _id: id
        });

        if(options.find.populate){
            query.populate(options.find.populate);
        }

        query.exec().then(function (result) {
        	if(options.find.processOne){
                return res.json(options.find.processOne(result, req));
            }
            var resultJson ={};
            resultJson[options.resource || options.model.collection.name] = result;
            res.json(resultJson);
        });
    };
};
