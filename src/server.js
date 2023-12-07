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
import ProductModel from "./dao/models/product.model.js";
import MessagesModel from "./dao/models/messages.model.js";

await init();
const PORT = 8080;
//!Http server
const serverHttp = http.createServer(app);
//!Socket io server
const io = new Server(serverHttp);
//!Backend Emits
io.on("connection", async (socketClient) => {
  const products = await ProductModel.find();
  const messages = await MessagesModel.find();
  console.log(`A new client is connected 👌 (${socketClient.id}) `);
  socketClient.emit("products", ...products);
  socketClient.emit("messages", messages);
  socketClient.on("disconnect", () => {
    console.log(`Client id ${socketClient.id} disconnected`);
  });

  socketClient.on("productSocket", async (newProduct) => {
    await ProductModel.create(...newProduct);
    const productsUpdated = await ProductModel.find();
    await socketClient.emit("productsUpdated", productsUpdated);
  });

  socketClient.on("idToDelete", async (deleteProduct) => {
    await ProductModel.deleteOne({ _id: deleteProduct });
  });

  socketClient.on("new-message", async ({ username, text }) => {
    let messages = await MessagesModel.create({
      user: username,
      message: text,
    });
    io.emit("messages", messages);
  });

  io.emit("message_everyone", `Client connected😎`);
  socketClient.broadcast.emit("new-client");
});

serverHttp.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
