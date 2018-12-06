var mongoose = require('mongoose');

// eslint-disable-next-line new-cap
var schema = mongoose.Schema({
  name: String,
  age: Number,
  inLaw: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  spouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Person',
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'House',
  },
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal',
  }],
});

// eslint-disable-next-line consistent-return
module.exports = function() {
  try {
    if (mongoose.model('Person')) {
      return mongoose.model('Person');
    }
  } catch (err) {
    return mongoose.model('Person', schema);
  }
};
