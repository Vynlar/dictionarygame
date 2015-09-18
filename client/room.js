Meteor.subscribe("rooms");

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.registerHelper("inRoom", function()  {
  if(Session.get("roomId")) return true;
  else return false;
});

Meteor.startup(function() {
  Session.set("roomId", "");
  if(location.hash != "" && location.hash != "#")
    Session.set("roomId", location.hash.split("#")[1]);
  Session.set("phase", "writing");
});

Template.defList.helpers({
  definitions: function() {
    if(Session.get("roomId") != null || Session.get("roomId") != "") {
      var room = Room.findOne({_id: Session.get("roomId")});
      if(room)
        return room.definitions;
    } else
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

Template.defForm.helpers({
  writing: function() {
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room) {
      if(room.phase == "writing") {
        Session.set("phase", "writing");
        return true;
      } else {
        Session.set("phase", "voting");
       return false; 
      }
    }
  }
});

Template.phase.helpers({
  phase: function() {
    return Session.get("phase");
  }
});

Template.nextPhase.events({
  'click .nextPhaseButton': function(e) {
    Meteor.call("nextPhase", Session.get("roomId"));
  }
});

Template.nextPhase.helpers({
  /*room: function() {
    console.log(Session.get("roomId"));
    if(Session.get("roomId") == "")
      return false;
    else
      return true;
  },*/
  isOwner: function(){
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room) {
      if(Meteor.userId() == room.owner)
        return true;
      else
        return false;
    }
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
