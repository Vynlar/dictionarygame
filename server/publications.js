Meteor.publish("rooms", function() {
  return Room.find();
});
