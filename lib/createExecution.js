module.exports = function (options) {
    return function (req, res) {

        req.model.save(function(err, model){
            res.status(201).json({_id: model._id});
        });

    };
}