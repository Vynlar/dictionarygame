var writingPhase = "writing";
var votingPhase = "voting";

Methods = {};

Methods.joinRoom = function(roomId) {
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(!Helpers.isPlayerInRoom(room)) {
      Room.update({_id: roomId}, {$push: {players: {username: Meteor.user().username, score: 0}}});
    }
  }
};

Methods.createRoom = function() {
  var def = Helpers.getRandomWord();
  return Room.insert({
    players: [{username: Meteor.user().username, score: 0}],
    owner: Meteor.userId(),
    word: def.word,
    phase: writingPhase,
    definitions: [Helpers.createDefinition(def, "server")],
    voted: 0
  });
};

Methods.nextPhase = function(roomId) {
  var room = Helpers.getRoom(roomId);
  var players = room.players;

  for(var i = 0; i < room.definitions.length; i++) {
    var def = room.definitions[i];
    for(var j = 0; j < players.length; j++) {
      if(players[j].username == def.username) {
        Room.update({_id: roomId, "players.username": def.username}, {$inc: {"players.$.score": 2*def.votes.length}});
      }
      if(def.username == "server") {
        for(var k = 0; k < def.votes.length; k++) {
          Room.update({_id: roomId, "players.username": def.votes[k]}, {$inc: {"players.$.score": 1}});
        }
      }
    }
  }

  room = Helpers.getRoom(roomId);
  Helpers.checkWin(room);

  if(room.phase == writingPhase) {
    Room.update({_id: roomId}, {$set: {phase: votingPhase, voted: 0}});
  } else {
    var newDef = Helpers.getRandomWord();
    Room.update({_id: roomId}, {$set: {phase: writingPhase, word: newDef.word, definitions: [Helpers.createDefinition(newDef, "server")]}});
  }
};

Methods.addDefinition = function(text, roomId) {
  var room = Helpers.getRoom(roomId);

  var presentInRoom = false;
  for(var i = 0; i < room.players.length; i++) {
    if(room.players[i].username == Meteor.user().username) {
      presentInRoom = true;
    }
  }
  if(!presentInRoom) return;
  //returns if a def is already present
  for(var j = 0; j < room.definitions.length; j++) {
    if(room.definitions[j].username == Meteor.user().username) {
      return;
    }
  }

  //make all definitions lower case for consistency
  text = text.toLowerCase();

  Room.update({_id: roomId},
              {$push: {definitions: {text: text, username: Meteor.user().username, votes: []}}});
  // XXX
  room = Helpers.getRoom(roomId);
  var shuffled = Helpers.shuffle(room.definitions);
  // XXX
  if(Helpers.checkDefinitionsEnded(room)) {
    //Go to voting phase
    Meteor.call("nextPhase", roomId);
  }
  Room.update({_id: roomId},
              {$set: {definitions: Helpers.shuffled}});
};

Methods.getPlayerName = function(playerId) {
  var player = Meteor.users.findOne({_id: playerId});
  return player.username;
};

Methods.removePlayer = function(roomId, username) {
  var room = Helpers.getRoom(roomId);
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
    if(Helpers.checkVotingEnded(Helpers.getRoom(roomId))) {
      Meteor.call("nextPhase", roomId);
    }
    if(Helpers.checkDefinitionsEnded(room)) {
      Meteor.call("nextPhase", roomId);
    }
  }
};

Methods.vote = function(roomId, username) {
  var room = Helpers.getRoom(roomId);
  if(room) {
    if(Helpers.isPlayerInRoom(room)) {
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
  if(Helpers.checkVotingEnded(Helpers.getRoom(roomId))) {
    Meteor.call("nextPhase", roomId);
  }
};

Meteor.methods({
  joinRoom: Methods.joinRoom,
  createRoom: Methods.createRoom,
  nextPhase: Methods.nextPhase,
  addDefinition: Methods.addDefinition,
  getPlayerName: Methods.getPlayerName,
  removePlayer: Methods.removePlayer,
  vote: Methods.vote
});
