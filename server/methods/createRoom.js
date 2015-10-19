Methods.createRoom = function() {
  var def = Helpers.getRandomWord();
  return Room.insert({
    players: [{username: Meteor.user().username, score: 0}],
    owner: Meteor.userId(),
    word: def.word,
    phase: WRITING_PHASE,
    definitions: [Helpers.createDefinition(def, "server")],
    correctDef: "",
    voted: 0
  });
};
