var mongoose = require('mongoose');

// eslint-disable-next-line new-cap
var schema = mongoose.Schema({
  name: String,
});

// eslint-disable-next-line consistent-return
module.exports = function() {
  try {
    if (mongoose.model('Animal')) {
      return mongoose.model('Animal');
    }
  } catch (err) {
    return mongoose.model('Animal', schema);
  }
};
