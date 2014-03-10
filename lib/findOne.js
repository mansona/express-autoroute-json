module.exports = function (options) {
    return function (req, res) {
        var query = options.model.findOne({
            _id: req.params.id
        });

        query.exec().then(function (results) {
            res.json(results);
        });
    };
}