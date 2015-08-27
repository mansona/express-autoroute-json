module.exports = function (options) {
    return function (req, res, next) {

        req.model.save(function(err, result){
            if(err){
                return next(err);
            }

            var resultJson ={};
            resultJson[options.resource || options.model.collection.name] = result;
            res.status(201).json(resultJson);

            next();
        });

    };
};
