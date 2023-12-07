//!FS
//! import ProductManager from "../dao/ProductManager.js";
//! import path from "path";
//! const prodPath = path.resolve(__dirname, "./dao/productos.json");
//! const testingProducts = new ProductManager(prodPath);

import { Router } from "express";
import { __dirname } from "../utils.js";
import productModel from "../dao/models/product.model.js";
import { uploader } from "../utils.js";
import mongoosePaginate from "mongoose-paginate-v2";
const prodRouter = Router();
const URL_BASE = `http://localhost:8080/img/`;
const URL_PRODUCTS = "http://localhost:8080/api/products";
const buildResponse = data => {
  return {
    status: "success",
    payload: data.docs.map(product => product.toJSON()),
    totalPages: data.totalPages,
    prevPage: data.prevPage,
    nextPage: data.nextPage,
    page: data.page,
    hasPrevPage: data.hasPrevPage,
    hasNextPage: data.hasNextPage,
    prevLink: data.hasPrevPage ? `${URL_PRODUCTS}?limit=${data.limit}&page=${data.prevPage}${data.category ? `&category=${data.category}` : ""}${data.stock ? `&stock=${data.stock}` : ""}` : "",
    nextLink: data.hasNextPage ? `${URL_PRODUCTS}?limit=${data.limit}&page=${data.nextPage}${data.category ? `&category=${data.category}` : ""}${data.stock ? `&stock=${data.stock}` : ""}` : ""
  };
};
prodRouter.get("/products", async (req, res) => {
  try {
    let {
      limit = 10,
      page = 1,
      category,
      stock,
      query,
      sort
    } = req.query; //query, sort
    const opts = {
      page,
      limit,
      sort: {
        price: sort || "asc"
      }
    };
    const criteria = {};
    if (category) {
      criteria.category = category;
    }
    if (stock) {
      criteria.stock = stock;
    }
    if (query) {
      query = JSON.parse(query);
      criteria.query = query;
    }
    const paginate = await productModel.paginate(criteria, opts);
    // res.status(200).render("home", buildResponse(paginate));
    res.status(200).render("products", buildResponse({
      ...paginate,
      category,
      stock
    }));
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message
    });
  }
});
prodRouter.get("/products/:pid", async (req, res) => {
  try {
    let {
      pid
    } = req.params;
    //! let productById = await productModel.findById(pid);

    const paginateId = await productModel.paginate({
      _id: pid
    }, {
      limit: 1
    });
    if (!productById) {
      res.json({
        error: "Product Not Found",
        message: `The product id ${pid} not found`
      });
    } else {
      res.render("home", buildResponse(paginateId));
    }
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
});
prodRouter.post("/products", uploader.single("thumbnails"), async (req, res) => {
  try {
    const filename = req.file.filename;
    const imageURL = `${URL_BASE}${filename}`;
    const {
      title: prodTitle,
      description: prodDescription,
      code: prodCode,
      price: prodPrice,
      status: prodStatus,
      stock: prodStock,
      category: prodCategory
    } = req.body;
    const prodThumbnails = imageURL || "";
    const products = await productModel.find();
    if (!(prodTitle && prodDescription && prodCode && prodPrice && prodStock && prodCategory) || products.find(prod => prod.code === prodCode)) {
      res.status(400).json({
        status: `One or more required field in the JSON is empty, the product wasn't add or Code ${prodCode} already exists`
      });
    } else {
      await productModel.create({
        title: prodTitle,
        description: prodDescription,
        code: prodCode,
        price: prodPrice,
        status: prodStatus || true,
        stock: prodStock,
        category: prodCategory,
        thumbnails: prodThumbnails
      });
      const newProd = await productModel.find();
      res.status(201).send(newProd.find(prod => prod.code === prodCode));
    }
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
});
prodRouter.put("/products/:pid", async (req, res) => {
  let {
    pid
  } = req.params;
  const {
    title: prodTitle,
    description: prodDescription,
    code: prodCode,
    price: prodPrice,
    status: prodStatus,
    stock: prodStock,
    category: prodCategory,
    thumbnails: prodThumbnails
  } = req.body;
  await productModel.updateOne({
    _id: pid
  }, {
    $set: {
      title: prodTitle,
      description: prodDescription,
      code: prodCode,
      price: prodPrice,
      status: prodStatus,
      stock: prodStock,
      category: prodCategory,
      thumbnails: prodThumbnails
    }
  });
  const products = await productModel.find();
  try {
    await res.status(204).end();
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
});
prodRouter.delete("/products/:pid", async (req, res) => {
  let {
    pid
  } = req.params;
  await productModel.deleteOne({
    _id: pid
  });
  const products = await productModel.find();
  try {
    if (products.find(prod => prod._id === pid)) {
      res.status(200).json({
        message: `The product id ${pid} was deleted`
      });
    } else {
      res.status(404).json({
        message: `The product ${pid} not found`
      });
    }
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message
    });
  }
});
export default prodRouter;