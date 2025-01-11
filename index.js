const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({ origin: "*", methods: ["GET", "POST"], credentials: true }));

app.get("/", (req, res) => {
  res.send("hello world");
});

server.listen(5005, () => {
  console.log("Server is started on port 5005");
});

const AllUser = {};
const allrooms = [];

io.on("connection", (socket) => {
  AllUser[socket.id] = {
    socket: socket,
    online: true,
    playing: false,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = AllUser[socket.id];
    currentUser.play_name = data.play_name;

    let opponentPlayer;
    for (const key in AllUser) {
      const user = AllUser[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allrooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      opponentPlayer.playing = true;
      currentUser.playing = true;

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.play_name,
        playerAs: "cross",
      });
      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.play_name,
        playerAs: "circle",
      });
      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", () => {
    const currentUser = AllUser[socket.id];
    currentUser.online = false;
    currentUser.playing = false;
    for (let index = 0; index < allrooms.length; index++) {
      const { player1, player2 } = allrooms[index];
      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentleftMatch");
        break;
      }
      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentleftMatch");
        break;
      }
    }
  });
});

/*

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { userInfo } = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.send("hello world");
});

server.listen(5005, () => {
  console.log("Server is started on port 5005");
});

// Example socket.io usage
const AllUser = {};
io.on("connection", (socket) => {
  AllUser[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = AllUser[socket.id];
    currentUser.play_name = data.play_name;
    // console.log(currentUser);
    let opponentPlayer;
    for (const key in AllUser) {
      const user = AllUser[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }
    if (opponentPlayer) {
      // console.log("fount opponent");
      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.play_name,
      });
      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.play_name,
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnected", function () {
    const currentUser = AllUser[socket.id];
    currentUser.online = false;
  });
}); 



*/
