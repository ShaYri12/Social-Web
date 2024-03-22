import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const accessChat = async (req, res) => {
    const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    const isChat = await db.query(
      "SELECT * FROM chats WHERE isGroupChat = 0 AND (users LIKE ? AND users LIKE ?)",
      [req.user.id, userId]
    );

    if (isChat.length > 0) {
      return res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: JSON.stringify([req.user.id, userId]) // Assuming your db stores arrays as JSON strings
      };

      const createdChat = await db.query("INSERT INTO chats SET ?", chatData);
      const fullChat = await db.query("SELECT * FROM chats WHERE id = ?", [createdChat.insertId]);
      return res.status(200).json(fullChat[0]);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
    })
};

export const fetchChats = async (req, res) => {
    const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
  try {
    const results = await db.query(
      "SELECT * FROM chats WHERE users LIKE ?",
      [req.user.id]
    );

    // Process results, populate latestMessage, etc.
    return res.status(200).send(results);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
})
};

export const createGroupChat = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  try {
    const { users, name } = req.body;
    if (!users || !name) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const parsedUsers = JSON.parse(users);
    if (parsedUsers.length < 2) {
      return res.status(400).json({ message: "More than 2 users are required to form a group chat" });
    }

    parsedUsers.push(req.user.id);

    const groupChat = {
      chatName: name,
      users: JSON.stringify(parsedUsers), // Assuming your db stores arrays as JSON strings
      isGroupChat: true,
      groupAdmin: req.user.id
    };

    const createdGroupChat = await db.query("INSERT INTO chats SET ?", groupChat);
    const fullGroupChat = await db.query("SELECT * FROM chats WHERE id = ?", [createdGroupChat.insertId]);
    return res.status(200).json(fullGroupChat[0]);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
})
};

export const renameGroup = async (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", async (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
      
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await db.query("UPDATE chats SET chatName = ? WHERE id = ?", [chatName, chatId]);
    if (updatedChat.affectedRows === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.json(updatedChat);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
})
};

export const removeFromGroup = async (req, res) => {
    const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
  try {
    const { chatId, userId } = req.body;
    const removed = await db.query("UPDATE chats SET users = JSON_REMOVE(users, JSON_UNQUOTE(JSON_SEARCH(users, 'one', ?)))) WHERE id = ?", [userId, chatId]);
    if (removed.affectedRows === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.json(removed);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
})
};

export const addToGroup = async (req, res) => {
    const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
  try {
    const { chatId, userId } = req.body;
    const added = await db.query("UPDATE chats SET users = JSON_ARRAY_APPEND(users, '$', ?) WHERE id = ?", [userId, chatId]);
    if (added.affectedRows === 0) {
      return res.status(404).json({ message: "Chat not found" });
    }
    return res.json(added);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
})
};

export default {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
