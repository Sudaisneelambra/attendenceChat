const express = require('express');
require('dotenv').config();
const cors = require('cors');

const port = process.env.PORT || 3000; 
const DB_URL = process.env.DB_URL;

const mongoose = require('mongoose');
const leave =require('./models/leave')
const tockenCheck = require('./controllers/common')


const app = express();
app.use(cors());
app.use(express.json())
const cron = require('node-cron');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: { origin: '*' }
});

let array = [];

io.use((socket, next) => {
  socket.username = socket.handshake.auth.username;
  socket.userId = socket.handshake.auth.employeeId;

  console.log(`User connected with username: ${socket.username}`);
  next();
}).on('connection', (socket) => {
  console.log('A user connected');
  const user = {
    employeeId: socket.userId,
    username: socket.username,
    socketId: socket.id
  };
  array.push(user);

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    array = array.filter(u => u.socketId !== socket.id);

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

  app.use('/admin/leaveApproval', tockenCheck,
  async (req, res) => {
    try {
      const { leaveId } = req.body;;
      const leaveReq = await leave.findOne({_id:leaveId});
      if (!leaveReq) {
        return res.status(404).json({ message: "request not found" });
      }
      leaveReq.approved = !leaveReq.approved;
      const saved = await leaveReq.save();
      if (saved && leaveReq.approved) {
        const emp = array.find((m)=>{
            return m.employeeId == leaveReq.employeeId
        })
        if(emp) {
            const time = new Date();
            const currentTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const notification = {
            message: ' The admin approved your leave',
            Time: currentTime
            };
            io.to(emp.socketId).emit('leaveApproval', notification);
        }
      }
      return res
        .status(200)
        .json({ message: "Block status updated successfully", leaveReq });
    } catch (error) {
      console.error("Error updating block status:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  mongoose
  .connect(DB_URL)
  .then(() => {
    console.log(`database connected successfully`);
    httpServer.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });
  })
  .catch((err) => {
    console.log(err);
    console.log(`Database connection failed`);
  });

