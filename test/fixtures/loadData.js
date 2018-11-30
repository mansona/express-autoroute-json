const mongoose = require('mongoose');
const Q = require('q');

const Chat = require('../models/chat')();

const chats = [];

function init() {
  var promises = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(i) {
    return Chat.create({
      name: 'person' + i,
      count: i,
    }).then((chatObject) => {
      chats.push(chatObject);
    });
  });

  return Q.all(promises);
}

function reset() {
  // only allow this in test
  if (process.env.NODE_ENV === 'test') {
    chats.length = 0;

    var { collections } = mongoose.connection;

    var promises = Object.keys(collections).map(function(collection) {
      return Q.ninvoke(collections[collection], 'remove');
    });

    return Q.all(promises);
  }

  // eslint-disable-next-line max-len
  var errorMessage = 'Excuse me kind sir, but may I enquire as to why you are currently running reset() in a non test environment? I do propose that it is a beastly thing to do and kindly ask you to refrain from this course of action. Sincerely yours, The Computer.';
  console.log(errorMessage);
  console.error(errorMessage);
  throw new Error(errorMessage);
}

module.exports = {
  init: init,
  reset: reset,
  data: {
    chats,
  },
};
