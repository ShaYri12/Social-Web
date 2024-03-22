import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "UPDATE users SET `name`=?,`city`=?,`website`=?,`profilePic`=?,`coverPic`=? WHERE id=? ";

    db.query(
      q,
      [
        req.body.name,
        req.body.city,
        req.body.website,
        req.body.profilePic,
        req.body.coverPic,
        userInfo.id,
      ],
      (err, data) => {
        if (err) res.status(500).json(err);
        if (data.affectedRows > 0) return res.json("Updated!");
        return res.status(403).json("You can update only your post!");
      }
    );
  });
};

export const searchUsers = (req, res) => {
  const searchTerm = req.query.searchTerm;
  
  const q = "SELECT * FROM users WHERE name LIKE ? OR username LIKE ?";
  
  const searchValue = `%${searchTerm}%`;
  
  db.query(q, [searchValue, searchValue], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
};


export const getSuggestedUsers = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const userId = userInfo.id;

    // Get the list of users followed by the authenticated user
    const followingQuery = "SELECT followedUserId FROM relationships WHERE followerUserId = ?";
    db.query(followingQuery, [userId], (err, followingData) => {
      if (err) return res.status(500).json(err);

      const followedUserIds = followingData.map((item) => item.followedUserId);

      if (followedUserIds.length === 0) {
        // If the user is not following anyone, provide some default suggestions
        const defaultSuggestionsQuery = "SELECT * FROM users WHERE id != ? ORDER BY RAND() LIMIT 2";
        db.query(defaultSuggestionsQuery, [userId], (err, defaultSuggestionsData) => {
          if (err) return res.status(500).json(err);
          return res.json(defaultSuggestionsData);
        });
      } else {
        // Query to get users not followed by the authenticated user
        const notFollowingQuery = "SELECT * FROM users WHERE id NOT IN (?) AND id != ?";
        db.query(notFollowingQuery, [followedUserIds, userId], (err, notFollowingData) => {
          if (err) return res.status(500).json(err);

          // Randomly select 2 or 3 users from the list
          const maxSuggestions = Math.min(2, notFollowingData.length);
          const suggestedUsers = [];
          while (suggestedUsers.length < maxSuggestions) {
            const randomIndex = Math.floor(Math.random() * notFollowingData.length);
            suggestedUsers.push(notFollowingData[randomIndex]);
            // Remove the selected user to avoid duplication
            notFollowingData.splice(randomIndex, 1);
          }

          return res.json(suggestedUsers);
        });
      }
    });
  });
};


export const updateOnlineStatus = (req, res) => {
  // Verify access token
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Extract user ID from token payload
    const userId = userInfo.id;
    const { online } = req.body;

    // Update user's online status in the database
    const q = 'UPDATE users SET online = ? WHERE id = ?';
    db.query(q, [online, userId], (err, result) => {
      if (err) {
        console.error('Error updating online status:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      // Send response upon successful update
      return res.status(200).json({ message: 'Online status updated successfully' });
    });
  });
};

export const getOnlineFollowedUsers = (req, res) => {
  // Verify access token
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");
  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Extract user ID from token payload
    const userId = userInfo.id;

    // Query to get followed user IDs
    const followingQuery = "SELECT followedUserId FROM relationships WHERE followerUserId = ?";
    db.query(followingQuery, [userId], (err, followingData) => {
      if (err) return res.status(500).json(err);

      // Extract followed user IDs
      const followedUserIds = followingData.map((item) => item.followedUserId);

      // Check if the user is following anyone
      if (followedUserIds.length === 0) {
        return res.status(200).json("");
      }

      // Query to get online followed users
      const onlineFollowedQuery = "SELECT * FROM users WHERE id IN (?) AND online = ?";
      db.query(onlineFollowedQuery, [followedUserIds, true], (err, onlineFollowedData) => {
        if (err) return res.status(500).json(err);
        return res.json(onlineFollowedData);
      });
    });
  });
};

