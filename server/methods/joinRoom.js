Methods.joinRoom = function(roomId) {
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(Meteor.user() && !Helpers.isPlayerInRoom(room)){
      Room.update({_id: roomId}, {$push: {players: {username: Meteor.user().username, score: 0}}});
    }
  }
};
