import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createHash, isValidPassword } from "../utils.js";
import userModel from "../dao/models/user.model.js";
const opts = {
  userNameField: "email",
  passReqToCallback: true,
};
export const init = () => {
  passport.use(
    "register",
    new LocalStrategy(opts, async (req, email, password, done) => {
      try {
        const user = await userModel.findOne({
          email,
        });
        if (user) {
          throw new Error("User already register");
        }
        const newUser = await userModel.create({
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
};
