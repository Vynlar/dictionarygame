Meteor.subscribe("rooms");

Meteor.startup(function() {
  Session.set("roomId", "");
  if(location.hash != "" && location.hash != "#")
    Session.set("roomId", location.hash.split("#")[1]);
});

Template.defList.helpers({
  definitions: function() {
    if(Session.get("roomId") != "")
      return Room.findOne({_id: Session.get("roomId")}).definitions
    else
      return [];
  }
});

Template.defForm.events({
  'submit .new-definition': function(e) {
    e.preventDefault();
    var definition = e.target.definition.value;

    Meteor.call("addDefinition", definition, Session.get("roomId"));

    e.target.definition.value = "";
  }
});

Template.createRoom.helpers({
  lacksRoomId: function() {
    if(Session.get("roomId") == "") 
      return true;
    else
      return false;
  }
});

Template.createRoom.events({
  'click .createRoom': function(e) {
    Meteor.call("createRoom", function(error, roomId) {
      if(error) return console.log(error.message);
      Session.set("roomId", roomId); 
      location.hash = "#" + roomId;
    });
  }
});
