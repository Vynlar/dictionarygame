Methods.removePlayer = function(roomId, username) {
  var room = Helpers.getRoom(roomId);
  if(room && room.owner == Meteor.userId()) {
    //remove player from room.players
    for(var p = 0; p < room.players.length; p++) {
      if(room.players[p].username == username) {
        room.players.splice(p, 1);
      }
    }
    //remove their votes
    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      if(room.phase == "voting") {
        //look through all the votes on the current def
        for(var j = 0; j < def.votes.length; j++) {
          //if the player voted
          if(def.votes[j] == username) {
            room.definitions[i].votes.splice(j, 1);
            room.voted--;
          }
        }
      }
      //if the player is the owner of the current def
      if(def.username == username) {
        room.definitions.splice(i, 1);
      }
    }
    Room.update({_id: roomId}, {$set: room});
    if(room.phase == VOTING_PHASE && Helpers.checkVotingEnded(room)) {
      Meteor.call("nextPhase", roomId);
    }
    if(room.phase == WRITING_PHASE && Helpers.checkDefinitionsEnded(room)) {
      Meteor.call("nextPhase", roomId);
    }
  }
};
