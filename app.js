const express = require("express");
const http = require("http");
const websocket = require("ws");
const router = require("./routes/index")

const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get('/control', router)
app.get('/', router)

const server = http.createServer(app);
const wss = new websocket.Server({ server });
const websockets = {}; //property: websocket, value: game

/*
 * regularly clean up the websockets object
 */
setInterval(function () {
  for (let i in websockets) {
    if (Object.prototype.hasOwnProperty.call(websockets, i)) {
      let game = websockets[i];
      //if the game has a final status, the game is complete/aborted
      if (game.gameState == "ABORTED") {
        delete websockets[i];
      }
    }
  }
}, 50000);

let connectionID = 0; //each websocket receives a unique ID
let duration = 1;
let pause = true;
let control;
let timer;

let startTimer = () => {
  timer = setInterval(() => {
    console.log("time: " + duration);
    if(pause) return;
    for (let i in websockets) {
      let socket = websockets[i];
      socket.send(JSON.stringify({ type: 'time', data: duration }));
    }
    duration++;
  }, 1000);
}

wss.on("connection", (ws) => {
  const con = ws;
  con["id"] = connectionID++;
  websockets[con["id"]] = con;

  con.on("message", (message) => {
    const body = JSON.parse(String(message));
    console.log(body)

    if(body.type == "start"){
      pause = false;
      startTimer();
    }
    if(body.type == "stop"){
      pause = true;
      clearInterval(timer);
    }
    if(body.type == "reset"){
      duration = 0;
    }
  });

  con.on("close", (code) => {
    console.log(code);
  });
});

// For running on the machine only, specify nothing -> localhost
// For exposing the server on the local network -> 0.0.0.0
// Get the internal ip of the PC it's running on
//    win: > ipconfig (Wireless LAN adapter Wi-Fi: 
//                      IPv4 address: <internal_ip>
//                    )
//    unix-based: hostname -I
// Open the browser and type in "http://<internal_ip>:<port>"
server.listen(port, () => console.log(`Running on http://localhost:${port}`));
