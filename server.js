const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const passport = require("passport");

// Import routes
const usersRoute = require("./routes/api/login/users");
const processRoute = require("./routes/api/process/process");

const app = express();

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
  })
);
app.use(bodyParser.json({limit: '50mb'}));
app.use(cors());

// DB Config
const db = require("./config/keys").mongoURI;

// Connect to MongoDB
mongoose
  .connect(
    db,
    { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    }
  )
  .then(() => console.log("Successfully connected to user database"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes middleware
app.use("/api/users", usersRoute);
app.use("/api/process", processRoute);

const port = 5000;
app.listen(port, () => console.log("Server started on port " + port));