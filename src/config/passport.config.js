import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GithubStrategy from "passport-github2";
import { createHash, isValidPassword } from "../utils.js";
import UserModel from "../dao/models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const opts = {
  usernameField: "email",
  passReqToCallback: true,
};

const githubOpts = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK,
};

export const init = () => {
  passport.use(
    "register",
    new LocalStrategy(opts, async (req, email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (user) {
          return done(new Error("User already register"));
        }
        const newUser = await UserModel.create({
          ...req.body,
          password: createHash(password),
        });
        done(null, newUser);
      } catch (error) {
        return done(
          new Error(`Error while User Authenticated  => ${error.message}`)
        );
      }
    })
  );

  passport.use(
    "login",
    new LocalStrategy(opts, async (req, email, password, done) => {
      try {
        const user = await UserModel.findOne({ email });
        if (!user) {
          return done(new Error("Invalid user or password❌"));
        }
        const isValidPass = await isValidPassword(password, user);
        if (!isValidPass) {
          return done(new Error("Invalid user or password❌"));
        }
        done(null, user);
      } catch (error) {
        return done(
          new Error(`Error while User Authenticated  => ${error.message}`)
        );
      }
    })
  );

  passport.use("github", new GithubStrategy(githubOpts));
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser(async (_id, done) => {
    const user = await UserModel.findById(_id);
    done(null, user);
  });
};
