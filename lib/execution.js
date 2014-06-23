module.exports = function (options) {
    return function (req, res) {
        var query = options.model.find(req.autorouteQuery).skip(req.autorouteOffset).limit(req.autorouteLimit).sort(req.autorouteSort);
        query.exec().then(function (results) {
            if(options.find.process){
                return res.json(options.find.process(results));
            }
            res.json(results);
        });
    };
}