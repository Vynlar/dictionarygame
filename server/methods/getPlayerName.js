Methods.getPlayerName = function(playerId) {
  var player = Meteor.users.findOne({_id: playerId});
  return player.username;
};
