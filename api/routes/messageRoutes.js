import express from "express";
import { allMessages, sendMessage } from "../controllers/messageControllers.js";

const router = express.Router();

router.get("/:chatId", allMessages);
router.post("/", sendMessage);


export default router;
