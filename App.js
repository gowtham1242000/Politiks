
const express = require('express');
const app = express();
const server = require('http').createServer(app); // Create HTTP server using Express app
//const io = require('socket.io')(server); // Include socket.io
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const db = require('./config/config');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const { Op } = require('sequelize');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');
const sequelize = require('./config/config');

const io = socketIo(server);
app.use((req, res, next) => {
  req.io = io; // Attach io instance to req
  next();
});
 
// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//const protectedRoutes = require('./routes/protectedRoutes'); // Add this line
require('dotenv').config();
// require('dotenv').config();

// Connect to the database
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

//   sequelize.sync({ force: true }).then(() => {
//     console.log("Database & tables created!");
//   })

// Middleware
app.use(express.json());
app.use(session({
    secret: '9e880f4a-7dc5-11ec-b9b5-0200cd936042',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

//app.use('/protected', protectedRoutes);
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('register', (userId) => {
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
    socket.join(`user_${userId}`);
  });
//true
  socket.on('newCommentNotification', (notification) => {
    console.log('Received new comment notification:', notification);
    io.emit('newCommentNotification', notification);
  });

//true
socket.on('newCommentLikeNotification', (notification) => {
  console.log('Received new like notification:', notification);
  // io.emit('newCommentLikeNotification', notification);
  io.to(`user_${notification.userId}`).emit('newCommentLikeNotification', notification);
});
//true
socket.on('postLikeNotification', (notification) => {
console.log('Received new like notification:', notification);
io.to(`user_${notification.userId}`).emit('postLikeNotification', notification);
});

//true
  socket.on('newSubCommentNotification', (notification) => {
    console.log('Received new sub-comment notification:', notification);
    io.to(`user_${notification.userId}`).emit('newSubCommentNotification', notification);
  });
//true
  socket.on('newLikeSubCommentNotification', (notification) => {
    console.log('Received new like sub-comment notification:', notification);
    io.to(`user_${notification.userId}`).emit('newLikeSubCommentNotification', notification);
  });

  socket.on('newFollowNotification', (notification) => {
    console.log('Received new follow notification:', notification);
    io.emit('newFollowNotification', notification);
  });

  // socket.on('newUnfollowNotification', (notification) => {
  //   console.log('Received new unfollow notification:', notification);
  //   io.emit('newUnfollowNotification', notification);
  // });

  
});




// Start the server
const PORT = process.env.PORT || 2000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
