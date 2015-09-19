var writingPhase = "writing";
var votingPhase = "voting";

Meteor.methods({
  joinRoom: function(roomId) {
    var room = getRoom(roomId);
    if(room) {
      if(!isPlayerInRoom(room)) {
        Room.update({_id: roomId}, {$push: {players: {username: Meteor.user().username, score: 0}}});
      }
    }
  },
  createRoom: function() {
    var def = getRandomWord();
    return Room.insert({
      players: [{username: Meteor.user().username, score: 0}],
      owner: Meteor.userId(),
      word: def.word,
      phase: writingPhase,
      definitions: [createDefinition(def, "server")]
    });
  },
  nextPhase: function(roomId) {
    var room = getRoom(roomId);
    var players = room.players;

    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      for(var j = 0; j < players.length; j++) {
        if(players[j].username == def.username) {
          Room.update({_id: roomId, "players.username": def.username}, {$inc: {"players.$.score": 3*def.votes.length}});
        }
        if(def.username == "server") {
          for(var k = 0; k < def.votes.length; k++) {
            Room.update({_id: roomId, "players.username": def.votes[k]}, {$inc: {"players.$.score": 1}});
          }
        }
      }
    }

    if(room.owner == Meteor.userId()) {
      if(room.phase == writingPhase) {
        Room.update({_id: roomId}, {$set: {phase: votingPhase}});
      } else {
        var newDef = getRandomWord();
        Room.update({_id: roomId}, {$set: {phase: writingPhase, word: newDef.word, definitions: [createDefinition(newDef, "server")]}});
       }
    }
  },
  addDefinition: function(text, roomId) {
    var room = getRoom(roomId);
    for(var i = 0; i < room.definitions.length; i++) {
      if(room.definitions[i].username == Meteor.user().username) {
        return;
      }
    }
    Room.update({_id: roomId},
                {$push: {definitions: {text: text, username: Meteor.user().username, votes: []}}});
    var room = getRoom(roomId);
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
    var room = getRoom(roomId);
    if(room) {
      if(isPlayerInRoom(room)) {
        for(var i = 0; i < room.definitions.length; i++) {
          var def = room.definitions[i];
          for(var j = 0; j < def.votes.length; j++) {
            var user = def.votes[i];
            if(Meteor.user().username == user) {
              return;
            }
          }
        }
      }
    }
    Room.update({_id: roomId, "definitions.username": username},{$push: {"definitions.$.votes": Meteor.user().username}});
  }
});
