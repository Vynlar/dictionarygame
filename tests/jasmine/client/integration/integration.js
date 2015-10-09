describe("Room Creation", function() {
  Accounts.createUser({
    username: "vynlar",
    password: "purple",
    email: "vynlar@vynlar.com"
  });

  it("should not show the create room button when you are not logged in", function(done) {
    Meteor.logout(function() {
      expect($(".createRoom").html()).toBeUndefined();
      done();
    });
  });

  it("should show the create button when you are logged in", function(done) {
    Meteor.loginWithPassword("vynlar", "purple", function() {
      expect(Meteor.user().username).toEqual("vynlar");
      expect($(".createRoom").html()).not.toBeUndefined();
      Meteor.logout(function() {
        done();
      });
    });
  });

  it("should update the url when you create a room", function(done) {
    console.log(window.location.hash);
    Meteor.loginWithPassword("vynlar", "purple", function(error) {
      expect(error).toBeUndefined();
      expect(window.location.hash.length).toBeGreaterThan(1);
      Meteor.logout(function() {
        done();
      });
    });
  });
});
