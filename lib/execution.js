//TODO should this function protect against an offset which is less than the limit
var createPrevious = function(offset, limit) {
    if (offset > 0) {
        return {
            offset: offset - limit,
            limit: limit
        };
    }
    return null;
};

var createCurrent = function(offset, limit) {
    return {
        offset: offset,
        limit: limit
    };
};

var createNext = function(count, offset, limit) {
    var current = offset + limit;
    var remainder = count - current;
    if (current != count) {
        return {
            offset: offset + limit,
            limit: (remainder >= limit) ? limit : remainder
        };
    }

    return null;
};


var createMeta = function(count, offset, limit) {
    return {
        previous: createPrevious(offset, limit),
        current: createCurrent(offset, limit),
        next: createNext(count, offset, limit),
        count: count
    };
};

module.exports = function(options) {
    //Pagination has been applied to the find
    if (options.find.limit) {
        return function(req, res) {
            //First carry out a count so that we can fill in the meta data
            options.model
                .count(req.autorouteQuery)
                .sort(req.autorouteSort)
                .exec()
                .then(function(count) {
                    //Do the find and pass the results and meta to the process
                    options.model
                        .find(req.autorouteQuery)
                        .skip(req.autorouteOffset)
                        .limit(req.autorouteLimit)
                        .sort(req.autorouteSort)
                        .exec()
                        .then(function(results) {
                            var meta = createMeta(count, req.autorouteOffset, req.autorouteLimit);
                            if (options.find.process) {
                                //Allow the user to process the data themselves and thus key the items correctly
                                return res.json(options.find.process(results, meta));
                            }

                            //Send back a generic respond using 'data' instead of the model name for the key
                            return res.json({
                                data: results,
                                meta: meta
                            });
                        });
                });
        };
    } else {
        //Developer doesn't want any pagination on their results
        return function(req, res) {
            var query = options.model.find(req.autorouteQuery).sort(req.autorouteSort);
            query.exec().then(function(results) {
                if (options.find.process) {
                    return res.json(options.find.process(results));
                }
                res.json(results);
            });
        };
    }
};
