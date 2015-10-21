describe("Methods", function() {
  beforeEach(function() {
    MeteorStubs.install();
  });

  afterEach(function() {
    MeteorStubs.uninstall();
  });

  describe("joinRoom():", function() {
    it("should add a user into the room if they are not already in the room", function() {
      spyOn(Room, "update");
      spyOn(Helpers, "getRoom").and.returnValue({players: []});

      Methods.joinRoom({roomId: "foo"});

      expect(Room.update).toHaveBeenCalled();
    });

    it("should not add a user if the user is already in the room", function() {
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({username: "vynlar"});
      spyOn(Helpers, "getRoom").and.returnValue({players: [{username: "vynlar"}]});

      Methods.joinRoom({roomId: "foo"});

      expect(Room.update).not.toHaveBeenCalled();
    });
  });

  describe("createRoom():", function() {
    it("should call Room.insert once with the appropriate information", function() {
      spyOn(Room, "insert");
      spyOn(Meteor, "user").and.returnValue({username: "vynlar"});
      spyOn(Meteor, "userId").and.returnValue("12345");
      spyOn(Helpers, "getRandomWord").and.returnValue({word: "word"});
      spyOn(Helpers, "createDefinition").and.returnValue({text: "def", username: "server"});

      Methods.createRoom();

      expect(Room.insert).toHaveBeenCalled();

      var roomArgs = Room.insert.calls.mostRecent().args[0];
      //should create only one room
      expect(Room.insert.calls.count()).toEqual(1);
      //players
      expect(roomArgs.players[0].username).toEqual("vynlar");
      expect(roomArgs.players.length).toEqual(1);
      //definitions
      expect(roomArgs.definitions[0].text).toEqual("def");
      expect(roomArgs.definitions[0].username).toEqual("server");
      expect(roomArgs.definitions.length).toEqual(1);
      //other
      expect(roomArgs.owner).toEqual("12345");
      expect(roomArgs.word).toEqual("word");
    });
  });

  describe("nextPhase():", function() {
    it("should add score to the appropriate players", function() {
      spyOn(Meteor, "user").and.returnValue({username: "vynlar"});
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [
          {username: "vynlar", score: 0},
          {username: "vynlar2", score: 1}
        ],
        definitions: [
          {text: "vynlar def", username: "vynlar", votes: ["vynlar2"]},
          {text: "vynlar2 def", username: "vynlar2", votes: []},
          {text: "server def", username: "server", votes: ["vynlar"]}
        ],
        phase: "voting"
      });
      spyOn(Helpers, "checkWin").and.returnValue(false);
      spyOn(Room, "update");
      spyOn(Helpers, "createDefinition").and.returnValue({text: "newDef", username: "server"});
      spyOn(Helpers, "getRandomWord").and.returnValue({word: "newWord"});

      Methods.nextPhase("roomId");

      expect(Room.update).toHaveBeenCalledWith({_id: "roomId", "players.username": "vynlar"}, {$inc: {"players.$.score": 2*1}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId", "players.username": "vynlar"}, {$inc: {"players.$.score": 1}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId"}, {$set: {phase: "writing", word: "newWord", definitions: [{text: "newDef", username: "server"}]}});
    });
  });

  describe("addDefinition():", function() {
    it("should add the submitted definition into the room", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [
          {username: "vynlar"}
        ],
        definitions: [],
        phase: WRITING_PHASE
      });
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({username: "vynlar"});

      Methods.addDefinition("def", "roomId");

      expect(Room.update).toHaveBeenCalled();
      expect(Room.update.calls.argsFor(0)[0]._id).toEqual("roomId");
      expect(Room.update.calls.argsFor(0)[1].$push.definitions.text).toEqual("def");
    });
    it("should disallow players NOT in the room from adding definitions", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [
          {username: "vynlar"}
        ],
        definitions: []
      });
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({username: "vynlar2"});

      Methods.addDefinition("def", "roomId");

      expect(Room.update).not.toHaveBeenCalled();
    });
    it("should not allow players to submit 2 definitions", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [
          {username: "vynlar"}
        ],
        definitions: [{text: "def1", username: "vynlar"}]
      });
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({username: "vynlar"});

      Methods.addDefinition("def", "roomId");

      expect(Room.update).not.toHaveBeenCalled();
    });
    it("should allow players to submit only during writing", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        _id: "roomId",
        phase: "voting",
        players: [{username: "vynlar"}]
      });
      spyOn(Room, "update");

      Methods.addDefinition("def", "roomId");

      expect(Room.update).not.toHaveBeenCalled();
    });
  });

  describe("vote():", function() {
    it("should block the player from voting twice", function() {
      spyOn(Room, "findOne").and.returnValue({
        definitions: [{username: "vynlar2", votes: ["vynlar"]}],
        players: [{username: "vynlar"}]
      });
      spyOn(Room, "update");

      Methods.vote("roomId", "vynlar2");

      expect(Room.update).not.toHaveBeenCalled();
    });
    it("should block the player from voting for themself", function() {
      spyOn(Room, "findOne").and.returnValue({
        definitions: [{username: "vynlar", votes: []}],
        players: [{username: "vynlar"}]
      });
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({
        username: "vynlar"
      });

      Methods.vote("roomId", "vynlar");

      expect(Room.update).not.toHaveBeenCalled();
    });
    it("should block the player from voting in a room they are not in", function() {
      spyOn(Room, "findOne").and.returnValue({
        players: [{username: "vynlar2"}]
      });

      spyOn(Room, "update");
      Methods.vote("roomId", "vynlar");

      expect(Room.update).not.toHaveBeenCalled();
    });
    it("should only allow players who wrote to vote", function() {
      spyOn(Room, "findOne").and.returnValue({
        players: [{username: "vynlar2"}],
        definitions: [{username: "vynlar2"}]
      });
      spyOn(Room, "update");
      spyOn(Meteor, "user").and.returnValue({
        username: "vynlar"
      });

      Methods.vote("roomId", "vynlar2");

      expect(Room.update).not.toHaveBeenCalled();
    });
  });

  describe("removePlayer():", function() {
    xit("should remove the player, their votes, and their definitions from the room", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [{username: "vynlar"},
                  {username: "vynlar2"}],
        definitions: [{username: "vynlar", votes: ["vynlar2"]},
                      {username: "vynlar2", votes: ["vynlar"]}],
        voted: 1
      });

      spyOn(Room, "update");
      spyOn(Meteor, "call");

      Methods.removePlayer("roomId", "vynlar");

      expect(Room.update).toHaveBeenCalledWith({_id: "roomId"}, {$pop: {players: "vynlar"}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId", "definitions.username": "vynlar2"}, {$pop: {"definitions.$.votes": "vynlar"}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId"}, {$pop: {players: "vynlar"}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId", "definitions.username": "vynlar"}, {$pop: {"definitions": "vynlar"}});
      expect(Room.update).toHaveBeenCalledWith({_id: "roomId"}, {$inc: {voted: -1}});
      expect(Meteor.call).toHaveBeenCalledWith("nextPhase", "roomId");
    });
    xit("should go to the writing phase if the player was the last person not to submit a def", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [{username: "vynlar"},
                  {username: "vynlar2"},
                  {username: "vynlar3"},
                  {username: "vynlar4"}],
        definitions: [{username: "vynlar2", votes: []},
                      {username: "vynlar3", votes: []},
                      {username: "vynlar4", votes: []}],
        phase: "writing"
      });
      spyOn(Meteor, "call");

      Methods.removePlayer("roomId", "vynlar");

      expect(Meteor.call).toHaveBeenCalledWith("nextPhase", "roomId");
    });
    it("should not advance phase if everyone else had not submitted a def", function() {
      spyOn(Helpers, "getRoom").and.returnValue({
        players: [{username: "vynlar"},
                  {username: "vynlar2"},
                  {username: "vynlar3"},
                  {username: "vynlar4"}],
        definitions: [{username: "vynlar2"},
                      {username: "vynlar3"},
                      {username: "vynlar4"}],
        phase: "writing"
      });
      spyOn(Meteor, "call");

      fail();
    });
    xit("should go to the next phase if the kicked player was the only one who had not submitted", function() {
      fail("Unimplimented");
    });
    xit("should go to the next phase if the kicked player was the only one who had not voted", function() {
      fail("Unimplimented");
    });
    xit("should only let the owner of the room kick", function() {
      fail("Unimplimented");
    });
  });
});
