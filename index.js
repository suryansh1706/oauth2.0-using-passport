const express = require('express')
const passport = require('passport');
const session = require('express-session')
const mongoose = require('mongoose');
require('dotenv').config();
require('./auth');

const app = express()
app.use(express.json());


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}


app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// basic route
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>')
})



async function startServer() {
  try {
    await mongoose.connect(
      "mongodb+srv://suryansh_db_user:tbc2wGgke4Ubnl3w@login.evfahd2.mongodb.net/?appName=login"
    );

    console.log("Connected to MongoDB");

    app.listen(5000, () => {
      console.log("App listening on port 5000!");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); // stop app if DB fails
  }
}

startServer();

// link to authenticate with Google
app.get('/auth/google',
  passport.authenticate('google', {scope: [ 'email', 'profile' ]}
));

app.get('/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/protected',
        failureRedirect: '/auth/failure'
}));


// protected route where we want the user to be logged in (stage after authentication)
app.get('/protected', isLoggedIn, (req, res) => {
  res.send(`Hello ${req.user.displayName}`);
});

// logout route
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy(() => {
      res.send('Goodbye!');
    });
  });
});


app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate..');
});




