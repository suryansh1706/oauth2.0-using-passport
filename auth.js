const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const Users = require('./models/product.models');

passport.use(new GoogleStrategy(
  {
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
          email: profile.email,
        });
      }

      return done(null, user); // <-- IMPORTANT
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // store only MongoDB ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});