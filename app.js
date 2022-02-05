require("dotenv").config();
require("./config/database").connect();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const User = require("./model/User");
const bcrypt = require("bcryptjs/dist/bcrypt");
const jwt = require("jsonwebtoken");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.post("/register", async (req, res) => {
  try {
    const {userName, password, name} = req.body;
    if (!(userName && password && name)) {
      res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ userName });

    if (oldUser) {
      return res.status(400).send("User already exist, please login!");
    }

    encryptedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      userName,
      name,
      password : encryptedPassword
    });

    const token = jwt.sign(
      { user_id : user._id, userName : userName },
        process.env.TOKEN_KEY,
      {
        expiresIn : "2h"
      }
    );

    user.token = token;

    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { userName, password } = req.body;

    // Validate user input
    if (!(userName && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ userName });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, userName },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json({ token });
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (err) {
    console.log(err);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

/**
 * 
 Client ---> Server (for authentication) (username, password)
 Server ---> DB (username, password verify)
 Client <--- Server (JWT Token)
 Client ---> Server (request header will contain JWT Token)
 Server will verify each time if the token is valid and not expired
 */
