/**
 * Game state object
 * @param {PlayerUI} ui
 * @param {*} socket
 */
class State {
  constructor(socket) {
    this.socket = socket;
    this.type = null;
  }

  setType(type) {
    return this.type = type;
  }
  setTimer = function (seconds) {
    let el = document.getElementById("timer");
    let mm = ~~(seconds / 60); // integer division
    let ss = seconds % 60;
    let time = `${mm < 10 ? '0' : ''}${mm}:${ss < 10 ? '0' : ''}${ss}`;
    el.innerText = time;
  }
}

const start = function (socket) {
  console.log("start");
  socket.send(JSON.stringify({ type: 'start', data: 0 }));
}

const stop = function (socket) {
  console.log("stop");
  socket.send(JSON.stringify({ type: 'stop', data: 0 }));
}
const reset = (socket) => {
  console.log("reset");
  socket.send(JSON.stringify({ type: 'reset', data: 0 }));
}

let state = null;

//set everything up, including the WebSocket
(function setup() {
  let url = location.origin;
  let _ws = url.startsWith('https') ? 'wss' : 'ws';
  const socket = new WebSocket(location.origin.replace(/^https?/, _ws) + "/");
  
  console.log(socket.url);

  state = new State(socket);

  if(window.location.pathname == "/control"){
    document.getElementById('start-button').addEventListener('click', function() {
      socket.send(JSON.stringify({ type: 'start', data: 0 }));
    });
    document.getElementById('stop-button').addEventListener('click', function() {
      socket.send(JSON.stringify({ type: 'stop', data: 0 }));
    });
    document.getElementById('reset-button').addEventListener('click', function() {
      socket.send(JSON.stringify({ type: 'reset', data: 0 }));
    });
  }

  socket.onmessage = function (event) {
    let payload = JSON.parse(event.data);
    console.log(payload);

    // The players are connecting into the game
    if (payload.type == "type") {
      state.setType(payload.data); //should be "A" or "B"
    }

    // Update the duration of the game
    if (payload.type == "time") {
      state.setTimer(payload.data);
    }

  };

  socket.onopen = function () {
    socket.send(JSON.stringify({ type: "joined", data: null }));
  };

  //server sends a close event only if the game was aborted from some side
  socket.onclose = function () {
  };

  socket.onerror = function () { };
})();