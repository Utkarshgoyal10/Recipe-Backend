const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
require("dotenv").config();



const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cors({
    origin: '*',
  }));
  app.use(cors());
app.use(cors(""));
const io = socketIO(server,{
  cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
  },
});

const users = {};

io.on('connection', socket => {
  socket.on('new-user-joined', namee => {
      console.log("New user joined:", namee);
      users[socket.id] = namee;
      socket.broadcast.emit('user-joined', namee);
  });

  socket.on('send', message => {
      socket.broadcast.emit('receive', { message: message, namee: users[socket.id] });
  });
  socket.on('disconnect', message => {
      socket.broadcast.emit('left', users[socket.id]);
      delete users[socket.id]
  });
});

const port = process.env.PORT || 8000;
const auth = require("./Routes/auth");

require("./model/connection.js");
app.get("/", (request, response) => {
    response.send("hello");
  })
app.use("/auth", auth);

server.listen(port, () => {
    console.log(`Sever is up ${port} `);
  }); 
