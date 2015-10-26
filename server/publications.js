Meteor.publish("rooms", function() {
  var user = Meteor.users.findOne({_id: this.userId});
  return Room.find({"players.username": user.username});
  //return Room.find();
});
