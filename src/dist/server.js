//! import ProductManager from "./dao/ProductManager.js";
//! import path from "path";
//! const prodPath = path.resolve(__dirname, "./dao/productos.json");
//! const testingProducts = new ProductManager(prodPath);
//!BACKEND
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import { __dirname } from "./utils.js";
import init from "./dao/mongodb.js";
import productModel from "./dao/models/product.model.js";
import messagesModel from "./dao/models/messages.model.js";
await init();

//!Http server
const serverHttp = http.createServer(app);
//!Socket io server
const io = new Server(serverHttp);
//!Backend Emits
io.on("connection", async (socketClient) => {
  const products = await productModel.find();
  const messages = await messagesModel.find();
  console.log(`A new client is connected 👌 (${socketClient.id}) `);
  socketClient.emit("products", ...products);
  socketClient.emit("messages", messages);
  socketClient.on("disconnect", () => {
    console.log(`Client id ${socketClient.id} disconnected`);
  });
  socketClient.on("productSocket", async (newProduct) => {
    await productModel.create(...newProduct);
    const productsUpdated = await productModel.find();
    await socketClient.emit("productsUpdated", productsUpdated);
  });
  socketClient.on("idToDelete", async (deleteProduct) => {
    await productModel.deleteOne({
      _id: deleteProduct,
    });
  });
  socketClient.on("new-message", async ({ username, text }) => {
    let messages = await messagesModel.create({
      user: username,
      message: text,
    });
    io.emit("messages", messages);
  });
  io.emit("message_everyone", `Client connected😎`);
  socketClient.broadcast.emit("new-client");
});
const PORT = 8080;
serverHttp.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
