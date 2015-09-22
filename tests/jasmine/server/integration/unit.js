describe("helpers", function() {
  describe("checkVotingEnded():", function() {
    it("should return true if the definitions and votes are equal", function() {
      var room = {
        voted: 3,
        definitions: [null, null, null]
      }

      expect(checkVotingEnded(room)).toEqual(true);
    });
    it("should return false if the definitions are more then the votes", function() {
      var room = {
        voted: 2,
        definitions: [null, null, null]
      }

      expect(checkVotingEnded(room)).toEqual(false);
    });
    it("should return true if the definitions are greater than the votes", function() {
      var room = {
        voted: 4,
        definitions: [null, null, null]
      }

      expect(checkVotingEnded(room)).toEqual(false);
  });
});
