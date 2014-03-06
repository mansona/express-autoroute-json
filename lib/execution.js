module.exports = function (options) {
    return function (req, res) {
        var query = options.model.find(req.autorouteQuery).sort(req.autorouteSort);
        
        query.exec().then(function (results) {
            res.json(results);
        });
    };
}