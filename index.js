const express = require('express');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const nocache = require('nocache');
const connectDB = require('./config/db');
const flash = require('connect-flash');
const path = require('path');

const app = express();
// app.use(nocache());
app.use(flash());

// Parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// User routes
app.use("/", require("./routes/userRoutes"));

// Admin routes
app.use("/admin", require("./routes/adminRoutes"));

// 404 - error Page
app.use((req, res, next) => {
  res.status(404).render("404-error");
});

// Connect to the database

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
