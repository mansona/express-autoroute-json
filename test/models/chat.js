var mongoose = require('mongoose');

// eslint-disable-next-line new-cap
var schema = mongoose.Schema({
  name: String,
  count: Number,
});

// eslint-disable-next-line consistent-return
module.exports = function() {
  try {
    if (mongoose.model('Chat')) {
      return mongoose.model('Chat');
    }
  } catch (err) {
    return mongoose.model('Chat', schema);
  }
};
