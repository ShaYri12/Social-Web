// messageControllers.js

import asyncHandler from "express-async-handler";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Chat from "../models/chatModel.js";

const allMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const sendMessage = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Create a new message
    let message = await Message.create({
      sender: req.user._id,
      content: content,
      chat: chatId,
    });

    // Populate sender field with name and pic
    message = await message.populate("sender", "name pic").execPopulate();

    // Populate chat field
    message = await message.populate("chat").execPopulate();

    // Ensure chat field is populated before further population
    if (!message.chat || !message.chat.users) {
      throw new Error("Chat not found or users not populated");
    }

    // Populate users field within chat
    await User.populate(message.chat, {
      path: "users",
      select: "name pic email",
    });

    // Update latestMessage field in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(400).send(error.message);
  }
});

export { allMessages, sendMessage };
