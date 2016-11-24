var mongoose = require('mongoose');

// eslint-disable-next-line new-cap
var schema = mongoose.Schema({
  name: String,
  age: Number,

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
    ref: 'Pet',
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
