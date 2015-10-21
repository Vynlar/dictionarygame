Methods.addDefinition = function(text, roomId) {
  var room = Helpers.getRoom(roomId);

  if(room.phase != WRITING_PHASE) return;
  if(!Helpers.isPlayerInRoom(room)) return;

  for(var j = 0; j < room.definitions.length; j++)
    if(room.definitions[j].username == Meteor.user().username) return;

  //make all definitions lower case for consistency
  text = text.toLowerCase();
  var random = Math.floor(Math.random() * (room.definitions.length+1));
  console.log(random);
  room.definitions.splice(
    random, //index to insert into
    0, //number of elements to remove
    { //object to insert
      text: text,
      username: Meteor.user().username,
      votes: []
    }
  );
  Room.update({_id: roomId}, {$set: room});

  if(Helpers.checkDefinitionsEnded(room)) Meteor.call("nextPhase", roomId);
};
