var mergeQueries = require('./helpers/mergeQueries');
var Q = require('q');

module.exports = function(options) {
  return function(req, res, next) {
    Q.fcall(function() {
      if (options.translateId) {
        return options.translateId(req.params.id, req);
      }

      return req.params.id;
    })

      .then(function(id) {
        var query = {
          _id: id,
        };

        if (req.autorouteQuery) {
          query = mergeQueries(req.autorouteQuery, query);
        }

        return options.model.findOneAndRemove(query).then(function(object) {
          if (!object) {
            throw new Error('NotFound');
          }
        });
      })

      .then(function() {
        res.status(204).send('');
        next();
      })

      .then(null, function(err) {
        if (err.name === 'CastError' || err.message === 'NotFound') {
          res.status(404).send({
            errors: [{
              detail: 'Not Found',
            }],
          });
        } else {
          res.status(500).send({
            errors: [{
              detail: err.message,
            }],
          });
        }
        return next(err);
      });
  };
};
