// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  res.status(500).json({
    errors: [{
      detail: err.message,
    }],
  });
};
