const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/v1/auth/github/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this GitHub ID
    let user = await User.findOne({ githubId: profile.id });
    
    if (user) {
      return done(null, user);
    }

    // Check if user exists with the same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link GitHub account to existing user
      user.githubId = profile.id;
      user.githubProfile = profile.profileUrl;
      user.profileImage = user.profileImage || profile.photos[0].value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      githubId: profile.id,
      username: profile.username || profile.displayName.replace(/\s+/g, '').toLowerCase(),
      email: profile.emails[0].value,
      fullName: profile.displayName || profile.username,
      githubProfile: profile.profileUrl,
      profileImage: profile.photos[0].value,
      password: 'github_oauth_' + Math.random().toString(36).substring(7), // Random password for OAuth users
      isVerified: true, // GitHub accounts are considered verified
      role: 'user'
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
