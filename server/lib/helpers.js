getRoom = function(roomId) {
  return Room.findOne({_id: roomId});
}

shuffle = function(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

isPlayerInRoom = function(room) {
  for(var i = 0; i < room.players.length; i++) {
    if(room.players[i].username == Meteor.user().username) {
      return true;
    }
  }
  return false;
}
