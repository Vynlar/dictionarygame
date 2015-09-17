Meteor.subscribe("rooms");

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Meteor.startup(function() {
  Session.set("roomId", "");
  if(location.hash != "" && location.hash != "#")
    Session.set("roomId", location.hash.split("#")[1]);
});

Template.defList.helpers({
  definitions: function() {
    if(Session.get("roomId") != null)
      return Room.findOne({_id: Session.get("roomId")}).definitions;
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

Template.judgeButton.events({
  'click .judgeButton': function(e) {
    Meteor.call("judgeGame", Session.get("roomId"), function(error, winner) {
      if(error) return console.log(error.message);
      if(winner != null) {
        Session.set("winner", winner.username);
        Meteor.setTimeout(function() {
          Session.set("winner", null);
          Meteor.call("clearRoom", Session.get("roomId"));
        }, 4000);
      }
    });
  }
});

Template.judgeButton.helpers({
  room: function() {
    console.log(Session.get("roomId"));
    if(Session.get("roomId") == "")
      return false;
    else
      return true;
  }
});

Template.winner.helpers({
  winner: function() {
    return Session.get("winner");
  },
  exists: function(a) {
    if(typeof a !== 'undefined' && a != null) return true;
    else return false;
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
