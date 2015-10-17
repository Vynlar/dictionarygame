Meteor.subscribe("rooms");

Accounts.ui.config({
  passwordSignupFields: "USERNAME_ONLY"
});

Template.registerHelper("inRoom", function()  {
  var roomId = Session.get("roomId");
  if(roomId) {
    var room = Room.findOne({_id: roomId});
    if(room && room.players) {
      for(var i = 0; i < room.players.length; i++) {
        if(room.players[i].username == Meteor.user().username) {
          return true;
        }
      }
    }
  }
  return false;
});

Meteor.startup(function() {
  Session.set("roomId", "");
  if(location.hash !== "" && location.hash !== "#") {
    Session.set("roomId", location.hash.split("#")[1]);
    Meteor.call("joinRoom", Session.get("roomId"));
  }
  Session.set("phase", "writing");
});

Template.correctDef.helpers({
  definition: function() {
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room.correctDef) {
      return "'" + room.correctDef + "'";
    }
    return "";
  }
});

Template.word.helpers({
  word: function() {
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room)
      return room.word;
  }
});

Template.playerList.events({
  "click .removePlayer": function(e) {
    var username = e.target.attributes['data-username'].value;
    Meteor.call("removePlayer", Session.get("roomId"), username);
  }
});

Template.playerList.helpers({
  players: function() {
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room) {
      return room.players;
    }
  },
  isOwner: function() {
    var room = Room.findOne({_id: Session.get("roomId")});
    if(Meteor.userId() == room.owner) return true;
    return false;
  },
  hidden: function(username) {
    return Meteor.user().username == username ? "hidden" : "";
  },
  submitted: function(username) {
    var room = Room.findOne({_id: Session.get("roomId")});
    for(var i = 0; i < room.definitions.length; i++) {
      console.log("looped");
      if(room.definitions[i].username == username) {
        console.log("ligntened");
        return "blue lighten-1";
      }
    }
    return "blue darken-2";
  }
});

Template.defList.events({
  "click .voteButton": function(e) {
    // XXX could switch it to use data tags instead of the id
    var username = e.target.parentElement.id;
    Meteor.call("vote", Session.get("roomId"), username);
  }
});

Template.defList.helpers({
  definitions: function() {
    if(Session.get("roomId") !== null || Session.get("roomId") !== "") {
      var room = Room.findOne({_id: Session.get("roomId")});
      if(room)
        return room.definitions;
    } else
      return [];
  },
  voting: function() {
    if(Session.get("phase") == "voting") return true;
    else return false;
  },
  hidden: function() {
    if(Session.get("phase") == "voting")
      return "";
    else
      return "hidden hiddenDef";
  },
  notCurrentUser: function(defUser) {
    if(Meteor.user().username == defUser) {
      return false;
    } else {
      return true;
    }
  }
});

var submitDefinition = function(e) {
  e.preventDefault();
  var form = document.getElementById("defForm");

  Meteor.call("addDefinition", form.definition.value, Session.get("roomId"));
  form.definition.value = "";
};

Template.defForm.events({
  'submit #defForm': submitDefinition,
  'click #formSubmitButton': submitDefinition
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
    var room = Room.findOne({_id: Session.get("roomId")});
    if(room) {
      return room.winner;
    }
  },
  exists: function(a) {
    if(typeof a !== 'undefined' && a !== null) return true;
    else return false;
  }
});

Template.createRoom.helpers({
  lacksRoomId: function() {
    if(Session.get("roomId") === "")
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
