// server.js

// set up ======================================================================
// get all the tools we need
const { isUndefined } = require('lodash');
const express = require('express');
const app = express();
const passport = require('passport');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const { establishConnection } = require('./config/db.js');

// configuration ===============================================================

establishConnection(); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', __dirname + '/views');

// required for passport
app.use(
  session({
    secret: !isUndefined(process.env.SESSION_SECRET)
      ? process.env.SESSION_SECRET
      : 'session-secret', // session secret
    resave: true,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
module.exports = { Server: app };
