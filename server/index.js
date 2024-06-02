// import express, {Request, Response} from "express"
// import cors from "cors"
require("dotenv").config()
const express = require('express');
const { createServer } = require("http")
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require("axios")
const PORT = process.env.PORT

const app = express();
app.use(cors())
app.use(express.json())
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*",//["http://localhost:3000", "http://192.168.0.101:3000", "http://192.168.0.102:3000", "http://192.168.0.100:3000", "http://192.168.0.103:3000"],
    methods: ["GET", "POST"]
  },
});


app.post("/new-game", async (req, res)=>{
  const newGame = await axios.post("https://creategame-djhwq4ivna-uc.a.run.app", req.body)
  res.send({status:200, message:"game created"})
})


io.on('connection', async (socket) => {
  console.log('User connected: ', socket.handshake.query.nickname);
  socket.join(socket.handshake.query.roomId)
  // socket.to(roomId).emit(`${socket.handshake.query.nickname} has joined`)

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.handshake.query.nickname);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

