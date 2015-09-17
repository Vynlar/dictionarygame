Meteor.methods({
  joinRoom: function(roomId) {
    Room.findOne({_id: roomId}, function(error, room) {
      if(error) {
        console.log(error.message);
        return;
      }
      //add player
    });
  },
  createRoom: function() {
    return Room.insert({players: [Meteor.user()]});
  },
  addDefinition: function(text, roomId) {
    Room.update({_id: roomId},
                {$push: {definitions: {text: text, playerId: Meteor.userId()}}});
  },
  checkAnswers: function() {
    Room.findOne({_id: Session.get("roomId")}, function(error, room) {
      if(error) console.log(error.message);            
      else {
        console.log(room);
      }
    });
  }
});
