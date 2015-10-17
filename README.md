# Dictionary Game

The Dictionary Game is a Meteor.js implementation of a tabletop/party game called Fictionary. Information about the details of fictionary can be found [here](https://en.wikipedia.org/wiki/Fictionary) and a brief summary will be provided below.

### Brief Summary

The game is played by two or more individuals. The computer chooses a random word that both players do not know the meaning of and places the real definition into a pool. The players then write their own fictional definitions and add them to the pool. Definitions are shuffled and presented to the players. The players must vote on which definition they think is the real one. Players earn points for fooling others into voting for their definition and are awarded less points for guessing the true definition.

### Technology

[Meteor.js](http://meteor.com) was used because of its easy to impliment multi-user data sharing. This was perfect for creating game rooms and live updates across clients.

### ToDo

* Finish writing tests on server
* Write client tests
* Filter dictionary for difficulty
* Make skip word button for host (trigger nextPhase twice or new function?)
* Decide and implement a win system
* Stretch Goals
  * Make players auto leave on browser close
  * AFK detection

### Contributors

* Adrian Aleixandre: [adrianaleixandre.com](http://adrianaleixandre.com)
  * Main Development
* Kolya Venturi: [kolya.co](http://kolya.co)
  * Data Gathering
  * General Advice
  * Wrote Tests
