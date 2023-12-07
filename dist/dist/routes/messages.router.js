import { Router } from "express";
import { __dirname } from "../utils.js";
import messagesModel from "../dao/models/messages.model.js";
const messagesRouter = Router();
messagesRouter.get("/messages", async (req, res) => {
  const messages = await messagesModel.find();
  res.status(200).render("chat", messages);
});
export default messagesRouter;
