const express = require('express')
const mongoose = require('mongoose');
const Users = require('./models/product.models');
const passport = require('passport');
const session = require('express-session')
const bcrypt = require('bcryptjs');
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


app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // STEP 1: Check if user already exists
  const existingUser = await Users.findOne({ username });
  if (existingUser) {
    return res.status(400).json({ msg: "User already exists" });
  }

  // STEP 2: Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // STEP 3: Create user
  const user = new Users({
    username,
    password: hashedPassword
  });

  await user.save();   // Saving user to DB

  res.json({ msg: "User registered successfully" });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // STEP 1: Check user exists
  const user = await Users.findOne({ username });
  if (!user) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  // STEP 2: Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Invalid credentials" });
  }

  // res.json({ msg: "Login successful" });
  // store user in session (REQUIRED)
  req.session.user = user;
  res.json({ msg: "Login successful" });
});



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




