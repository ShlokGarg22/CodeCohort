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

    // Get email from profile
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    
    // If no email, return error
    if (!email) {
      return done(new Error('Your GitHub account does not have a public email. Please add a public email to your GitHub profile and try again.'));
    }

    // Check if user exists with the same email
    user = await User.findOne({ email });
    
    if (user) {
      // Link GitHub account to existing user
      user.githubId = profile.id;
      user.githubProfile = profile.profileUrl;
      user.profileImage = user.profileImage || (profile.photos && profile.photos[0] ? profile.photos[0].value : null);
      await user.save();
      return done(null, user);
    }

    // Create new user
    const newUser = new User({
      githubId: profile.id,
      username: profile.username || (profile.displayName ? profile.displayName.replace(/\s+/g, '').toLowerCase() : 'githubuser'),
      email: email,
      fullName: profile.displayName || profile.username || 'GitHub User',
      githubProfile: profile.profileUrl,
      profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
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
