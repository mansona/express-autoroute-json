var mongoose = require('mongoose');

before(function() {
  mongoose.connect('mongodb://localhost/express-autoroute-json-test-database-piNMnJp8');
});
