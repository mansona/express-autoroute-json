module.exports = function (options) {
    return function (req, res) {
        var query = options.model.find(req.autorouteQuery);

        query.exec().then(function (results) {
            res.json(results);
        });
    };
}