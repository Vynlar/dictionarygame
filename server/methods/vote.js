Methods.vote = function(roomId, username) {
  if(Meteor.user().username == username) {
    return;
  }
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(Helpers.isPlayerInRoom(room)) {
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
      Room.update({_id: roomId, "definitions.username": username},{$push: {"definitions.$.votes": Meteor.user().username}});
      Room.update({_id: roomId},{$inc: {voted: 1}});
      if(Helpers.checkVotingEnded(Helpers.getRoom(roomId))) {
        Meteor.call("nextPhase", roomId);
      }
    }
  }
};
