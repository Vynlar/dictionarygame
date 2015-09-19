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
      definitions: [createDefinition(def, "server")],
      voted: 0
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

    if(room.phase == writingPhase) {
      Room.update({_id: roomId}, {$set: {phase: votingPhase, voted: 0}});
    } else {
      var newDef = getRandomWord();
      Room.update({_id: roomId}, {$set: {phase: writingPhase, word: newDef.word, definitions: [createDefinition(newDef, "server")]}});
    }
  },
  addDefinition: function(text, roomId) {
    var room = getRoom(roomId);
    
    var presentInRoom = false;
    for(var i = 0; i < room.players.length; i++) {
      if(room.players[i].username == Meteor.user().username) {
        presentInRoom = true;
      } 
    }
    if(!presentInRoom) return;
    //returns if a def is already present
    for(var i = 0; i < room.definitions.length; i++) {
      if(room.definitions[i].username == Meteor.user().username) {
        return;
      }
    }
    Room.update({_id: roomId},
                {$push: {definitions: {text: text, username: Meteor.user().username, votes: []}}});
    // XXX
    room = getRoom(roomId);
    var shuffled = shuffle(room.definitions);
    // XXX
    if(checkDefinitionsEnded(room)) {
      //Go to voting phase
      Meteor.call("nextPhase", roomId);
    }
    Room.update({_id: roomId},
                {$set: {definitions: shuffled}});
    
  },
  getPlayerName: function(playerId) {
    var player = Meteor.users.findOne({_id: playerId});
    console.log(player.username);
    return player.username;
  },
  removePlayer: function(roomId, username) {
    var room = getRoom(roomId);
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
      if(checkVotingEnded(getRoom(roomId))) {
        Meteor.call("nextPhase", roomId);
      }
      if(checkDefinitionsEnded(room)) {
        Meteor.call("nextPhase", roomId);
      }
    }
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
    Room.update({_id: roomId},{$inc: {voted: 1}});
    if(checkVotingEnded(room)) {
      Meteor.call("nextPhase", roomId);
    }
  }
});
