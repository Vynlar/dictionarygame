Methods.nextPhase = function(roomId) {
  var room = Helpers.getRoom(roomId);
  var players = room.players;

  if(room.phase == VOTING_PHASE) {
    for(var i = 0; i < room.definitions.length; i++) {
      var def = room.definitions[i];
      for(var j = 0; j < players.length; j++) {
        if(players[j].username == def.username) {
          Room.update({_id: roomId, "players.username": def.username}, {$inc: {"players.$.score": 2*def.votes.length}});
        }
      }
      if(def.username == "server") {
        for(var k = 0; k < def.votes.length; k++) {
          Room.update({_id: roomId, "players.username": def.votes[k]}, {$inc: {"players.$.score": 1}});
        }
        Room.update({_id: roomId}, {$set: {correctDef: room.word + " - " + def.text}});

      }
    }
  }

  room = Helpers.getRoom(roomId);
  //TODO: decide on a win system
  //Helpers.checkWin(room);

  if(room.phase == WRITING_PHASE) {
    Room.update({_id: roomId}, {$set: {phase: VOTING_PHASE, voted: 0}});
  } else {
    var newDef = Helpers.getRandomWord();
    Room.update({_id: roomId}, {$set: {phase: WRITING_PHASE, word: newDef.word, definitions: [Helpers.createDefinition(newDef, "server")]}});
  }
};
