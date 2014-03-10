var _ = require('underscore')._;

module.exports = function (first, second) {
    
    var commonKeys = _.intersection(_.keys(first), _.keys(second));
    
    var output = _.extend(_.omit(first || {}, commonKeys), _.omit(second || {}, commonKeys));

    _.each(commonKeys, function (key) {
        output["$and"] = [first, second];
    })
    return output;
}