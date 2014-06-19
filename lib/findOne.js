module.exports = function (options) {
    return function (req, res) {
        var query = options.model.findOne({
            _id: req.params.id
        });

        query.exec().then(function (results) {
        	if(options.find.processOne){
                return res.json(options.find.processOne(results));
            }
            res.json(results);
        });
    };
}