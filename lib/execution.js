module.exports = function (options) {
    return function (req, res) {
        var query = options.model.find(req.autorouteQuery, null, req.autorouteOptions);//.sort(req.autorouteSort);
        query.exec().then(function (results) {
            if(options.find.process){
                return res.json(options.find.process(results));
            }
            res.json(results);
        });
    };
}