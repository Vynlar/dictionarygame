var writingPhase = "writing";
var votingPhase = "voting";

function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }
  return array;
}

Meteor.methods({
  joinRoom: function(roomId) {
    var room = Room.findOne({_id: roomId});
    if(room) {
      for(var i = 0; i < room.players.length; i++) {
        if(room.players[i] == Meteor.userId()) {
          return;
        }
      }
      Room.update({_id: roomId}, {$push: {players: Meteor.userId()}});
    }
  },
  createRoom: function() {
    return Room.insert({
      players: [Meteor.userId()],
      owner: Meteor.userId(),
      word: "test",
      phase: writingPhase,
      definitions: [{text: "testing", username: "server", votes: []}]
                   //put random initial definition here
    });
  },
  nextPhase: function(roomId) {
    var room = Room.findOne({_id: roomId});
    if(room.owner == Meteor.userId()) {
      if(room.phase == writingPhase)
        Room.update({_id: roomId}, {$set: {phase: votingPhase}});
      else
        Room.update({_id: roomId}, {$set: {phase: writingPhase, definitions: []}});
                                                                    // put random new definition here
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
                {$push: {definitions: {text: text, username: Meteor.user().username, votes: []}}});
    var room = Room.findOne({_id: roomId});
    var shuffled = shuffle(room.definitions);
    Room.update({_id: roomId},
                {$set: {definitions: shuffled}});
  },
  getPlayerName: function(playerId) {
    var player = Meteor.users.findOne({_id: playerId});
    console.log(player.username);
    return player.username;
  },
  vote: function(roomId, username) {
    var room = Room.findOne({_id: roomId});
    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      for(var j = 0; j < def.votes.length; j++) {
        var user = def.votes[i];
        if(Meteor.user().username == user) {
          return;
        }
      }
    }
    Room.update({_id: roomId, "definitions.username": username},{$push: {"definitions.$.votes": Meteor.user().username}});
  }
});
