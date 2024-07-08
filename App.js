/*
const express = require('express');
const app = express();
const server = require('http').createServer(app); // Create HTTP server using Express app
const io = require('socket.io')(server); // Include socket.io
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
const sequelize = require('./config/config')
 
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


// Start the server
const PORT = process.env.PORT || 2000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
*/


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

  // socket.on('newComment', (data) => {
  //   console.log('Received new comment:', data);
  //   // Handle new comment logic
  //   io.emit('newComment', data); // Example: Broadcast new comment to all clients
  // });

  socket.on('newNotification', (notification) => {
    console.log('Received new notification:', notification);
    // Handle new notification logic
    io.emit('newNotification', notification); // Example: Broadcast new notification to all clients
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
//const PORT = process.env.PORT || ( "0.0.0.0" , 2000) ;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

