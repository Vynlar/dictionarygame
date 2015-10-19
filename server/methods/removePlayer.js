Methods.removePlayer = function(roomId, username) {
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(room.owner == Meteor.userId()) {
      //search through the room removing everything about a given player
      //remove player from array
      Room.update({_id: roomId}, {$pop: {players: username}});
      //remove their votes
      for(var i = 0; i < room.definitions.length; i++) {
        var def = room.definitions[i];
        for(var j = 0; j < def.votes.length; j++) {
          //if the player voted
          if(def.votes[j] == username) {
            Room.update({_id: roomId, "definitions.username": def.username}, {$pop: {"definitions.$.votes": username}});
            Room.update({_id: roomId}, {$inc: {voted: -1}});
          }
        }
        //if the player is the owner of the def
        if(def.username == username) {
          Room.update({_id: roomId, "definitions.username": username}, {$pop: {"definitions": username}});
        }
      }
    }
    if(Helpers.checkVotingEnded(Helpers.getRoom(roomId))) {
      Meteor.call("nextPhase", roomId);
    }
    if(Helpers.checkDefinitionsEnded(room)) {
      Meteor.call("nextPhase", roomId);
    }
  }
};
