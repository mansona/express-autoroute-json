var mongoose = require('mongoose');


var schema = mongoose.Schema({
  name: String,
  count: Number,
});

module.exports = function() {
  try {
    if (mongoose.model('Chat')) {
      return mongoose.model('Chat');
    }
  } catch (err) {
    return mongoose.model('Chat', schema);
  }
};
