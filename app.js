const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app); // Create an HTTP server using express
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
}); // Attach socket.io to the HTTP server

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
io.on("connection", (socket) => {
  io.emit("con", socket.id);
  console.log("A user connected", socket.id);

  socket.on("user-message", (message) => {
    console.log("messege:", message);
    io.emit("message", message);
  });

  socket.on("disconnect", (socket) => {
    console.log("A user disconnected");
    io.emit("dis", socket.id);
  });
});
