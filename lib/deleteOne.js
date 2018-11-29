const mergeQueries = require('./helpers/mergeQueries');
const Promise = require('bluebird');

module.exports = options =>
  (req, res, next) => Promise.resolve(options.translateId
    ? options.translateId(req.params.id, req)
    : req.params.id)
    .then((id) => {
      let query = {
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
      return res.status(204).send('');
    })

    .catch(function(err) {
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
