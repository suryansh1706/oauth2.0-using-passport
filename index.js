const express = require('express')
const passport = require('passport');
const session = require('express-session')
require('./auth');

const app = express()

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



app.listen(5000);
