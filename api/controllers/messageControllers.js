import jwt from "jsonwebtoken";
import { db } from "../connect.js";

export const allMessages = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    // Verify the JWT token
    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      const { chatId } = req.params;

      // Fetch messages for the given chatId
      const messages = await db.query(
        "SELECT m.*, u.name, u.pic, u.email FROM messages m JOIN users u ON m.sender = u.id WHERE m.chat = ?",
        [chatId]
      );

      return res.json(messages);
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send(error.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    // Verify the JWT token
    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      const { content, chatId } = req.body;

      // Check if content and chatId are provided
      if (!content || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
      }

      // Create a new message
      const newMessage = {
        sender: userInfo.id, // Use userInfo.id instead of req.user.id
        content: content,
        chat: chatId
      };

      // Insert the new message into the database
      const result = await db.query("INSERT INTO messages SET ?", [newMessage]);

      // Fetch the newly inserted message with sender details
      const message = await db.query(
        "SELECT m.*, u.name, u.pic, u.email FROM messages m JOIN users u ON m.sender = u.id WHERE m.id = ?",
        [result.insertId]
      );

      // Update the latestMessage field in the chat
      await db.query("UPDATE chats SET latestMessage = ? WHERE id = ?", [result.insertId, chatId]);

      return res.json(message[0]);
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(400).send(error.message);
  }
};

export default { allMessages, sendMessage };
