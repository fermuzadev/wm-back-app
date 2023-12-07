//!FS
//! import ProductManager from "../dao/ProductManager.js";
//! import path from "path";
//! const prodPath = path.resolve(__dirname, "../dao/productos.json");
//!const testingProducts = new ProductManager(prodPath);

import { Router } from "express";
import { __dirname } from "../utils.js";
import productModel from "../dao/models/product.model.js";
import UserModel from "../dao/models/user.model.js";
const router = Router();
router.get("/realtimeproducts", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }
    const products = await productModel.find();
    res.render("realTimeProducts", {
      title: "MongoDB Real-Time Products ",
      products,
      user: req.session.user
    });
  } catch (error) {
    res.status(404).json({
      message: error.message
    });
  }
});
export default router;