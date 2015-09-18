var writingPhase = "writing";
var votingPhase = "voting";

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
    return Room.insert({
      players: [Meteor.user()],
      owner: Meteor.userId(),
      definition: "testing",
      word: "test",
      phase: writingPhase,
      definitions: []
    });
  },
  nextPhase: function(roomId) {
    var room = Room.findOne({_id: roomId});
    if(room.owner == Meteor.userId()) {
      if(room.phase == writingPhase)
        Room.update({_id: roomId}, {$set: {phase: votingPhase}});
      else
        Room.update({_id: roomId}, {$set: {phase: writingPhase}});
    }
  },
  judgeGame: function(roomId) {
    var room = Room.findOne({_id: roomId});
    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      // loop through all the definitions
    }
    return null;
  },
  addDefinition: function(text, roomId) {
    var room = Room.findOne({_id: roomId});
    for(var i = 0; i < room.definitions.length; i++) {
      if(room.definitions[i].username == Meteor.user().username) {
        return;
      }
    }
    Room.update({_id: roomId},
                {$push: {definitions: {text: text, username: Meteor.user().username}}});
  },
  getPlayerName: function(playerId) {
    var player = Meteor.users.findOne({_id: playerId});
    console.log(player.username);
    return player.username;
  },
  clearRoom: function(roomId) {
    var room = Room.findOne({_id: roomId});
    if(Meteor.userId() == room.owner)
      Room.update({_id: roomId}, {definitions: []}); 
  }
});
