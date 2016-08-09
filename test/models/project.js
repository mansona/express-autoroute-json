var mongoose = require('mongoose');

// eslint-disable-next-line new-cap
var schema = mongoose.Schema({
  title: String,
  description: String,
  projectStart: Date,
  projectEnd: Date,
  tags: [String],
  isActive: Boolean,
});

// eslint-disable-next-line consistent-return
module.exports = function() {
  try {
    if (mongoose.model('Project')) {
      return mongoose.model('Project');
    }
  } catch (err) {
    return mongoose.model('Project', schema);
  }
};
