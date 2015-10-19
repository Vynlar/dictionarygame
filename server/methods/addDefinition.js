Methods.addDefinition = function(text, roomId) {
  var room = Helpers.getRoom(roomId);

  var presentInRoom = false;
  for(var i = 0; i < room.players.length; i++) {
    if(room.players[i].username == Meteor.user().username) {
      presentInRoom = true;
    }
  }
  if(!presentInRoom) return;
  //returns if a def is already present
  for(var j = 0; j < room.definitions.length; j++) {
    if(room.definitions[j].username == Meteor.user().username) {
      return;
    }
  }

  //make all definitions lower case for consistency
  text = text.toLowerCase();

  Room.update({_id: roomId},
              {$push: {definitions: {text: text, username: Meteor.user().username, votes: []}}});
  // XXX
  room = Helpers.getRoom(roomId);
  var shuffled = Helpers.shuffle(room.definitions);
  // XXX
  if(Helpers.checkDefinitionsEnded(room)) {
    //Go to voting phase
    Meteor.call("nextPhase", roomId);
  }
  Room.update({_id: roomId},
              {$set: {definitions: shuffled}});
};
