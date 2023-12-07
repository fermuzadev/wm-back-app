import { Router } from "express";
import { __dirname } from "../utils.js";

import MessagesModel from "../dao/models/messages.model.js";

const messagesRouter = Router();

messagesRouter.get("/messages", async (req, res) => {
  const messages = await MessagesModel.find();
  res.status(200).render("chat", messages);
});

export default messagesRouter;
