Methods.vote = function(roomId, username) {
  if(Meteor.user().username == username) {
    return;
  }
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(room.phase != VOTING_PHASE) {
      return;
    }
    if(Helpers.isPlayerInRoom(room)) {
      var playerSubmittedDef = false;
      for(var k = 0; k < room.definitions.length; k++) {
        if(Meteor.user().username == room.definitions[k].username) {
          playerSubmittedDef = true;
        }
      }
      if(!playerSubmittedDef) return;
      for(var i = 0; i < room.definitions.length; i++) {
        var def = room.definitions[i];
        for(var j = 0; j < def.votes.length; j++) {
          var user = def.votes[j];
          console.log("Comparing " + Meteor.user().username + " to " + user);
          if(Meteor.user().username == user) {
            return;
          }
        }
      }
      Room.update({_id: roomId, "definitions.username": username},{$push: {"definitions.$.votes": Meteor.user().username}, $inc: {voted: 1}});
      //Room.update({_id: roomId},{});
      if(Helpers.checkVotingEnded(Helpers.getRoom(roomId))) {
        Meteor.call("nextPhase", roomId);
      }
    }
  }
};
