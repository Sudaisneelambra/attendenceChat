const express = require('express');
require('dotenv').config();
const cors = require('cors');

const port = process.env.PORT || 3000; // Default port to 3000 if not provided

const app = express();
app.use(cors());
const cron = require('node-cron');

const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: { origin: '*' }
});

let array = [];

io.use((socket, next) => {
  socket.username = socket.handshake.auth.username;
  console.log(`User connected with username: ${socket.username}`);
  next();
}).on('connection', (socket) => {
  console.log('A user connected');
  const user = {
    username: socket.username,
    socketId: socket.id
  };
  array.push(user);
  console.log(array);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    array = array.filter(u => u.socketId !== socket.id);
    console.log(array);

  });

});

cron.schedule('0 9   * * 1-6', () => {

    const time = new Date();
    const currentTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notification = {
      message: 'This is a reminder that check-in time is at 9:00 AM. Please be on time, Thank You 🙏',
      Time: currentTime
    };
  
    array.forEach(user => {
      io.to(user.socketId).emit('checkInnotification', notification);
    });
  });

  cron.schedule('30 18  * * 1-6', () => {

    const time = new Date();
    const currentTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notification = {
      message: 'This is a reminder that check-Out time is at 6:30 AM. Please Check Out, Thank You 🙏',
      Time: currentTime
    };
  
    array.forEach(user => {
      io.to(user.socketId).emit('checkOutnotification', notification);
    });
  });


httpServer.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
