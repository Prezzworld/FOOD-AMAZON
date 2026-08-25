const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const config = require("config")
const {User} = require("../models/user");

passport.use(
	new GoogleStrategy(
		{
			clientID: config.get("googleClientId"),
			clientSecret: config.get("googleClientSecret"),
			callbackURL: config.get("googleCallbackUrl"),
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await User.findOne({ googleId: profile.id });
				if (user) {
					return done(null, user);
				}
				const email = profile.emails[0].value;
				user = await User.findOne({ email });
				if (user) {
					user.googleId = profile.id;
					await user.save();
					return done(null, user);
				}
				user = new User({
					googleId: profile.id,
					name: profile.displayName,
					email: profile.emails[0].value,
					password: require("crypto").randomBytes(32).toString("hex"),
					phoneNumber: "000-000-0000",
					role: "customer",
				});
				await user.save();
				return done(null, user);
			} catch (error) {
				const fail = done(error, null);
				return fail;
			}
		},
	),
);

module.exports = passport;
