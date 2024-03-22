import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { db } from "../connect.js";

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    req.userInfo = userInfo;
    next();
  });
};

export const accessChat = asyncHandler(async (req, res) => {
  verifyToken(req, res);

  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  try {
    const [isChat] = await db.query(`
      SELECT 
        c.*, 
        u.name AS groupAdminName, 
        u.profilePic AS groupAdminProfilePic,
        lm.id AS latestMessageId,
        lm.senderId AS latestMessageSenderId,
        lm.content AS latestMessageContent,
        lm.created_at AS latestMessageCreatedAt
      FROM chats c
      LEFT JOIN users u ON c.groupAdminId = u.id
      LEFT JOIN (
        SELECT * 
        FROM messages
        WHERE id IN (
          SELECT MAX(id) 
          FROM messages 
          GROUP BY chatId
        )
      ) lm ON c.id = lm.chatId
      WHERE c.isGroupChat = 0
      AND c.id IN (
        SELECT chatId
        FROM chat_users
        WHERE userId = ?
      )
    `, [userId]);

    if (isChat.length > 0) {
      return res.json(isChat[0]);
    }

    const [createdChat] = await db.query(`
      INSERT INTO chats (chatName, isGroupChat, groupAdminId)
      VALUES (?, 0, ?)
    `, ["sender", userId]);

    const [fullChat] = await db.query(`
      SELECT * FROM chats WHERE id = ?
    `, [createdChat.insertId]);

    res.status(200).json(fullChat[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const fetchChats = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT 
        c.*, 
        u.*, 
        lm.id AS latestMessageId,
        lm.senderId AS latestMessageSenderId,
        lm.content AS latestMessageContent,
        lm.created_at AS latestMessageCreatedAt
      FROM chats c
      LEFT JOIN chat_users cu ON c.id = cu.chatId
      LEFT JOIN users u ON cu.userId = u.id
      LEFT JOIN (
        SELECT * 
        FROM messages
        WHERE id IN (
          SELECT MAX(id) 
          FROM messages 
          GROUP BY chatId
        )
      ) lm ON c.id = lm.chatId
      WHERE cu.userId = ?
      ORDER BY c.updated_at DESC
    `;

    db.query(q, [userInfo.id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      res.status(200).json(results);
    });
  });
};


export const createGroupChat = asyncHandler(async (req, res) => {
  verifyToken(req, res);

  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: "Please provide all the fields" });
  }

  try {
    const [groupChat] = await db.query(`
      INSERT INTO chats (chatName, isGroupChat, groupAdminId)
      VALUES (?, 1, ?)
    `, [name, req.userInfo.id]);

    const chatId = groupChat.insertId;

    const insertValues = users.map(userId => [chatId, userId]);
    await db.query(`
      INSERT INTO chat_users (chatId, userId)
      VALUES ?
    `, [insertValues]);

    const [fullGroupChat] = await db.query(`
      SELECT * FROM chats WHERE id = ?
    `, [chatId]);

    res.status(200).json(fullGroupChat[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const renameGroup = asyncHandler(async (req, res) => {
  verifyToken(req, res);

  const { chatId, chatName } = req.body;

  try {
    await db.query(`
      UPDATE chats
      SET chatName = ?
      WHERE id = ?
    `, [chatName, chatId]);

    const [updatedChat] = await db.query(`
      SELECT * FROM chats WHERE id = ?
    `, [chatId]);

    res.json(updatedChat[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const removeFromGroup = asyncHandler(async (req, res) => {
  verifyToken(req, res);

  const { chatId, userId } = req.body;

  try {
    await db.query(`
      DELETE FROM chat_users
      WHERE chatId = ? AND userId = ?
    `, [chatId, userId]);

    const [removed] = await db.query(`
      SELECT * FROM chats WHERE id = ?
    `, [chatId]);

    res.json(removed[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export const addToGroup = asyncHandler(async (req, res) => {
  verifyToken(req, res);

  const { chatId, userId } = req.body;

  try {
    await db.query(`
      INSERT INTO chat_users (chatId, userId)
      VALUES (?, ?)
    `, [chatId, userId]);

    const [added] = await db.query(`
      SELECT * FROM chats WHERE id = ?
    `, [chatId]);

    res.json(added[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


export default {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
