//!FS
//!import userManager from "../dao/userManager.js";
//!import path from "path";
//! const wishPath = path.resolve(__dirname, "../dao/carrito.json");
//! const prodPath = path.resolve(__dirname, "../dao/useros.json");
//! const instanceusers = new userManager(prodPath);
//!import { getRandomId, saveJSONToFile, getJSONFromFile } from "../utils.js";

import { Router } from "express";
import { __dirname } from "../utils.js";
import WishModel from "../dao/models/wishlist.model.js";
import userModel from "../dao/models/user.model.js";
import { Exception } from "../utils.js";
import wishlistModel from "../dao/models/wishlist.model.js";

const wishRouter = Router();

//!HELPERS

async function getWish() {
  const users = await WishModel.find().populate("users.userId");
  return users;
}

async function addWish() {
  let newWish = await WishModel.create();
  return newWish;
}
//!POST METHODS

wishRouter.post("/wishlist", async (req, res) => {
  let newWish;
  let wishes = await getWish();
  newWish = await addWish();
  wishes.push(newWish);
  await WishModel.create(wishes);
  res.status(201).send(newWish);
});

wishRouter.post("/wishlist/:wid/users/:uid", async (req, res) => {
  try {
    const { wid, uid } = req.params;
    let wish = await WishModel.findOne({ _id: wid });
    let user = await userModel.findOne({ _id: uid });

    if (!user) {
      //!if user id dont't exists in users array
      res.status(404).send({
        status: "error",
        message: `The user ${uid} doesn't exist`,
      });
      return;
    }
    if (!wish) {
      //!if WishId doesn't exits in wish array
      res
        .status(404)
        .json({ status: "Error", message: `The wish ID ${wid} doesn't exist` });
      return;
    }

    const userFind = wish.users.find((wishUser) => wishUser.userId === uid);

    if (userFind) {
      //!if user exists inside wish list
      userFind.quantity++;
      //!await wishsModel.updateOne({ _id: wid }, newwish);
      res.status(201).send(wish);
    } else {
      //!If the user doesn't exists into the wish array
      wish.users.push({ userId: uid, quantity: 1 });
      //!await wishsModel.updateOne({ _id: wid }, { users: wish });
      res.status(201).send(wish);
    }
    await wish.save();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//!GET METHODS
wishRouter.get("/wishlist/:wid", async (req, res) => {
  let { wid } = req.params;
  let wish = await wishsModel.find({ _id: wid }).populate("users.userId");
  if (wish) {
    res.status(200).json(wish);
  } else {
    res.status(404).json({
      status: "error",
      message: `The id ${wid} is not found`,
    });
  }
});

wishRouter.get("/wishlist", async (req, res) => {
  let wish = await wishlistModel.find();
  try {
    res.status(200).json(wish);
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

//!PUT METHODS

//!This function update the wish with a put method with postman in an Array format(it replaces the quantity, it isn't an add method)
wishRouter.put("/wishlist/:wid", async (req, res) => {
  const { wid } = req.params;
  const users = req.body;
  try {
    //!Validate users & data format => Array
    if (!users || !Array.isArray(users)) {
      res.status(404).send("Not a valid data format");
      return;
    }
    //!I use find&update cause it do the two action and return the object updated with new : true
    const result = await wishsModel.findOneAndUpdate(
      { _id: wid },
      { $set: { users: users } },
      { new: true }
    );
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

wishRouter.put("/wishlist/:wid/users/:uid", async (req, res) => {
  const { wid, uid } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity) {
      res.status(404).json(`The quantity must be a number for the user ${uid}`);
      return;
    }
    const result = await wishsModel.updateOne(
      { _id: wid, "users.userId": uid },
      { $set: { "users.$.quantity": quantity } }
    );
    res.status(200).send("user updated");
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
//!DELETE METHODS

wishRouter.delete("/wishlist/:wid", async (req, res) => {
  let { wid } = req.params;
  let wish = await getwish();
  let findwish = await wishsModel.findOne({ _id: wid });
  if (!findwish) {
    res.status(404).json({
      message: `wish ${wid} not found`,
    });
    return;
  }
  try {
    await wishsModel.updateOne({ _id: wid }, { $set: { users: [] } });
    res.status(200).json({ message: `The wish ${wid} was empty` });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

wishRouter.delete("/wishlist/:wid/users/:uid", async (req, res) => {
  let { wid, uid } = req.params;
  let findwish = await wishsModel.findOne({ _id: wid });
  if (!findwish) {
    res.status(404).json({
      message: `wish ${wid} not found`,
    });
    return;
  }
  try {
    const indexuser = findwish.users.findIndex(
      (wishuser) => wishuser.userId.toString() === uid
    );
    //!If its founded
    if (indexuser !== -1) {
      findwish.users.splice(indexuser, 1);
      await wishsModel.findOneAndUpdate(
        { _id: wid },
        { $set: { users: findwish.users } }
      );
      res
        .status(200)
        .json({ message: `The user ${uid} was deleted on ${wid} wish` });
    } else {
      res
        .status(404)
        .json({ message: `user ${uid} doesn't found in the wish ${wid}` });
    }
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

export default wishRouter;
