const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Users = require('./models/product.models');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/google/callback",
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await Users.findOne({ googleId: profile.id });

    if (!user) {
      user = await Users.create({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.email
      });
    }

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await Users.findOne({ username });
      if (!user) return done(null, false);

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false);

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
