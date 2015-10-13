xdescribe("Room Creation", function() {
  Accounts.createUser({
    username: "vynlar",
    password: "purple",
    email: "vynlar@vynlar.com"
  });

  beforeEach(function(done) {
    Meteor.logout(function() {
      window.location.hash = "";
      //window.location.reload();
      setTimeout(function() {
        done();
      },100);
    });
  });

  it("should not show the create room button when you are not logged in", function(done) {
    Meteor.logout(function() {
      expect($(".createRoom")).not.toBeInDOM();
      done();
    });
  });

  it("should show the create button when you are logged in", function(done) {
    Meteor.loginWithPassword("vynlar", "purple", function() {
      expect(Meteor.user().username).toEqual("vynlar");
      setTimeout(function() {
        expect($(".createRoom")).toBeInDOM();
        done();
      },100);
    });
  });

  it("should update the url when you create a room", function(done) {
    window.location.hash = "";
    Meteor.loginWithPassword("vynlar", "purple", function(error) {

      expect(error).toBeUndefined();

      setTimeout(function() {
        $(".createRoom")[0].click();
        setTimeout(function() {
          expect(window.location.hash.length).toBeGreaterThan(1);
          done();
        },100);
      },100);
    });
  });
});
