const _ = require('lodash');
const camelcaseKeys = require('camelcase-keys');
const Promise = require('bluebird');

const defaultSerialise = require('./serialise');
const mergeQueries = require('./helpers/mergeQueries');

module.exports = options =>
  (req, res, next) => Promise.resolve(options.translateId
    ? options.translateId(req.params.id, req)
    : req.params.id)
    .then((id) => {
      const newModel = {};
      let query = {};

      query[options.idParameter || options.update.idParameter || '_id'] = id;

      if (req.autorouteQuery) {
        query = mergeQueries(req.autorouteQuery, query);
      }

      if (req.body.data.attributes) {
        _.assign(newModel, camelcaseKeys(req.body.data.attributes));
      }

      _.forEach(req.body.data.relationships, function(value, key) {
        if (value.data && value.data.id) {
          newModel[_.camelCase(key)] = value.data.id;
        }
        // delete relationship
        if (value.data === null) {
          newModel[_.camelCase(key)] = null;
        }
        // array relationship
        if (Array.isArray(value.data)) {
          newModel[_.camelCase(key)] = _.chain(value.data)
            .map('id')
            .compact()
            .value();
        }
      });

      return options.model.findOneAndUpdate(query, {
        $set: newModel,
      }, {
        new: true,
      }).then((updated) => {
        if (!updated) throw new Error('NotFound');

        req.model = updated;

        return Promise.resolve(options.translateId
          ? _.assign(updated.toJSON(), { id: req.params.id, originalId: updated.id })
          : updated);
      });
    })
    .then(function(result) {
      return options.find.processOne
        ? options.find.processOne(result, req)
        : result;
    })
    .then((processedResult) => {
      const serialiseFunction = _.get(options, 'find.serialise', defaultSerialise);
      return res.json(serialiseFunction(processedResult, options, defaultSerialise));
    })
    .catch(function(err) {
      if ((err.name === 'CastError' && err.kind === 'ObjectId') || err.message === 'NotFound') {
        // could not cast the ID
        return res.status(404).send({
          errors: [{
            detail: 'Not Found',
          }],
        });
      }
      return next(err);
    });
