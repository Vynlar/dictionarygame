var words = JSON.parse(Assets.getText("words.json"));

getRoom = function(roomId) {
  return Room.findOne({_id: roomId});
};

shuffle = function(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
};

isPlayerInRoom = function(room) {
  for(var i = 0; i < room.players.length; i++) {
    if(room.players[i].username == Meteor.user().username) {
      return true;
    }
  }
  return false;
};

getRandomWord = function() {
  var w = words[Math.floor(Math.random()*words.length)];
  return w;
};

createDefinition = function(word, player) {
  return {text: word.definition, username: player, votes: []};
};

checkVotingEnded = function(room) {
  if(room.voted >= room.definitions.length - 1) {
     return true;
  }
  return false;
};

checkDefinitionsEnded = function(room) {
  return (room.definitions.length - 1 == room.players.length) ? true : false;
};

checkWin = function(room) {
  for(var i = 0; i < room.players.length; i++) {
    if(room.players[i].score >= 11) {
      Room.update({_id: room._id}, {$set: {winner: room.players[i].username}});
      resetRoom(room);
    }
  }
};

resetRoom = function(room) {
  for(var i = 0; i < room.players.length; i++) {
    room.players[i].score = 0;
  }
  Room.update({_id: room._id}, {$set: {players: room.players}});
};
