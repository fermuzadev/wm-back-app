//!FS
//!import ProductManager from "../dao/ProductManager.js";
//!import path from "path";
//! const cartPath = path.resolve(__dirname, "../dao/carrito.json");
//! const prodPath = path.resolve(__dirname, "../dao/productos.json");
//! const instanceProducts = new ProductManager(prodPath);
//!import { getRandomId, saveJSONToFile, getJSONFromFile } from "../utils.js";

import { Router } from "express";
import { __dirname } from "../utils.js";
import CartsModel from "../dao/models/carts.model.js";
import productModel from "../dao/models/product.model.js";
import { Exception } from "../utils.js";

const cartsRouter = Router();

//!HELPERS

async function getCart() {
  const products = await CartsModel.find().populate("products.productId");
  return products;
}

async function addCart() {
  let newCart = await CartsModel.create();
  return newCart;
}
//!POST METHODS

cartsRouter.post("/carts", async (req, res) => {
  let newCart;
  let carts = await getCart();
  newCart = await addCart();
  carts.push(newCart);
  await CartsModel.create(carts);
  res.status(201).send(newCart);
});

cartsRouter.post("/carts/:cid/product/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    let cart = await CartsModel.findOne({ _id: cid });
    let product = await productModel.findOne({ _id: pid });

    if (!product) {
      //!if product id dont't exists in products array
      res.status(404).send({
        status: "error",
        message: `The product ${pid} doesn't exist`,
      });
      return;
    }
    if (!cart) {
      //!if cartId doesn't exits in cart array
      res
        .status(404)
        .json({ status: "Error", message: `The cart ID ${cid} doesn't exist` });
      return;
    }

    const productFind = cart.products.find(
      (cartProduct) => cartProduct.productId === pid
    );

    if (productFind) {
      //!if product exists inside cart array
      productFind.quantity++;
      //!await CartsModel.updateOne({ _id: cid }, newCart);
      res.status(201).send(cart);
    } else {
      //!If the products doesn't exists into the cart array
      cart.products.push({ productId: pid, quantity: 1 });
      //!await CartsModel.updateOne({ _id: cid }, { products: cart });
      res.status(201).send(cart);
    }
    await cart.save();
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//!GET METHODS
cartsRouter.get("/carts/:cid", async (req, res) => {
  let { cid } = req.params;
  let cart = await CartsModel.find({ _id: cid }).populate("products.productId");
  if (cart) {
    res.status(200).json(cart);
  } else {
    res.status(404).json({
      status: "error",
      message: `The id ${cid} is not found`,
    });
  }
});

cartsRouter.get("/carts", async (req, res) => {
  let cart = await getCart();
  try {
    res.status(200).json(cart);
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

//!PUT METHODS

//!This function update the cart with a put method with postman in an Array format(it replaces the quantity, it isn't an add method)
cartsRouter.put("/carts/:cid", async (req, res) => {
  const { cid } = req.params;
  const products = req.body;
  try {
    //!Validate products & data format => Array
    if (!products || !Array.isArray(products)) {
      res.status(404).send("Not a valid data format");
      return;
    }
    //!I use find&update cause it do the two action and return the object updated with new : true
    const result = await CartsModel.findOneAndUpdate(
      { _id: cid },
      { $set: { products: products } },
      { new: true }
    );
    if (result) {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

cartsRouter.put("/carts/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    if (!quantity) {
      res
        .status(404)
        .json(`The quantity must be a number for the product ${pid}`);
      return;
    }
    const result = await CartsModel.updateOne(
      { _id: cid, "products.productId": pid },
      { $set: { "products.$.quantity": quantity } }
    );
    res.status(200).send("Product updated");
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
//!DELETE METHODS

cartsRouter.delete("/carts/:cid", async (req, res) => {
  let { cid } = req.params;
  let cart = await getCart();
  let findCart = await CartsModel.findOne({ _id: cid });
  if (!findCart) {
    res.status(404).json({
      message: `Cart ${cid} not found`,
    });
    return;
  }
  try {
    await CartsModel.updateOne({ _id: cid }, { $set: { products: [] } });
    res.status(200).json({ message: `The cart ${cid} was empty` });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

cartsRouter.delete("/carts/:cid/product/:pid", async (req, res) => {
  let { cid, pid } = req.params;
  let findCart = await CartsModel.findOne({ _id: cid });
  if (!findCart) {
    res.status(404).json({
      message: `Cart ${cid} not found`,
    });
    return;
  }
  try {
    const indexProduct = findCart.products.findIndex(
      (cartProduct) => cartProduct.productId.toString() === pid
    );
    //!If its founded
    if (indexProduct !== -1) {
      findCart.products.splice(indexProduct, 1);
      await CartsModel.findOneAndUpdate(
        { _id: cid },
        { $set: { products: findCart.products } }
      );
      res
        .status(200)
        .json({ message: `The product ${pid} was deleted on ${cid} cart` });
    } else {
      res
        .status(404)
        .json({ message: `Product ${pid} doesn't found in the cart ${cid}` });
    }
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
});

export default cartsRouter;
