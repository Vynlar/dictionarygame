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
      word: "test"
    });
  },
  judgeGame: function(roomId) {
    var room = Room.findOne({_id: roomId});
    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      if(def.text == room.definition) {
        console.log("win " + def.text);
        console.log(def);
        return def;
      }
    }
    return null;
  },
  addDefinition: function(text, roomId) {
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
