const websocket = require("ws");

class Stopwatch {
  constructor(ID) {
    this.stopwatch = null;
    this.listeners = null;
    this.listenerCount = 0;
    this.id = ID;
    this.gameState = "EMPTY";
    this.duration = 0;
  }

  /**
   * Checks whether the game is full.
   * @returns {boolean} returns true if the game is full (2 players), false otherwise
   */
  hasStopwatch() {
    return this.stopwatch != null;
  }
  /**
   * Adds a player to the game. Returns an error if a player cannot be added to the current game.
   * @param {websocket} p WebSocket object of the player
   * @returns {(string|Error)} returns "A" or "B" depending on the player added; returns an error if that isn't possible
   */
  addListener(p) {
    if (this.hasStopwatch()) {
      return new Error(
        `Invalid call to addListener`
      );
    }

    if (this.stopwatch == null) {
      this.stopwatch = p;
      return "A";
    } else {
      this.listeners[this.listenerCount++] = p;
      return "B";
    }
  }

  startTimer() {
    setInterval(() => {
      if (!this.hasStopwatch()) return;
      this.playerA?.send(JSON.stringify({ type: 'time', data: this.duration }));
      for(const listener in this.listeners){
        const l = this.listeners[listener];
        l.send(JSON.stringify({ type: 'time', data: this.duration }));
      }
      this.duration++;
    }, 1000);
  }
  

}


module.exports = Game;

