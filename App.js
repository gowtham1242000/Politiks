const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const db = require('./config/config');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    socket.join(`user_${userId}`);
  });

  socket.on('newCommentNotification', (notification) => {
    console.log('Received new comment notification:', notification);
    io.emit('newCommentNotification', notification); // Example: Broadcast new comment notification to all clients
  });

  socket.on('newSubCommentNotification', (notification) => {
    console.log('Received new sub-comment notification:', notification);
    io.emit('newSubCommentNotification', notification); // Example: Broadcast new sub-comment notification to all clients
  });
  socket.on('newCommentLikeNotification', (notification) => {
    console.log('Received new like notification:', notification);
    io.emit('newLikeNotification', notification); // Example: Broadcast new like notification to all clients
  });
  socket.on('newLikeSubCommentNotification', (notification) => {
    console.log('Received new like sub-comment notification:', notification);
    io.emit('newLikeSubCommentNotification', notification); // Example: Broadcast new like sub-comment notification to all clients
  });
  socket.on('newFollowNotification', (notification) => {
    console.log('Received new follow notification:', notification);
    io.emit('newFollowNotification', notification); // Example: Broadcast new follow notification to all clients
  });
  socket.on('newUnfollowNotification', (notification) => {
    console.log('Received new unfollow notification:', notification);
    io.emit('newUnfollowNotification', notification); // Example: Broadcast new unfollow notification to all clients
  });
  socket.on('PostLikeNotification', (notification) => {
    console.log('Received new notification:', notification);
    io.emit('PostLikeNotification', notification);
    // Handle new notification logic if necessary
    // This can be used if you want to broadcast to all clients
  });
});



app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

const PORT = process.env.PORT || 2000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
