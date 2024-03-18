import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user";
import jwt from 'jsonwebtoken'

export const initializePassport = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID as string,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
                callbackURL: "/users/auth/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                if(!profile._json.email_verified) return done(null, false, { message: 'Email not verified' });
                const email = profile._json.email;
                if (!email) return done(null, false, { message: 'Email not found' });
                let user = await User.findOne({ email });
                if (!user) {
                    user = await User.create({ name: profile.displayName, email: email, verified: profile._json.email_verified });
                    await user.save();
                }
                const refresh_token = jwt.sign({ id: user._id, email: email }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: '7d' });
                const access_token = jwt.sign({ id: user._id, email: email }, process.env.JWT_SECRET as string, { expiresIn: '10m' });
                const token = { access_token, refresh_token };

                return done(null, token);
            })
    )
};