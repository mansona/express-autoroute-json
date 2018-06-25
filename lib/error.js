// eslint-disable-next-line no-unused-vars
module.exports = function (err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({
    errors: [{
      detail: err.message,
    }],
  });
};
