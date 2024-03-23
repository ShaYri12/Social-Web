import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

export const getUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json("User not found");
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error: ", error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const userId = userInfo.id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: req.body.name,
        city: req.body.city,
        website: req.body.website,
        profilePic: req.body.profilePic,
        coverPic: req.body.coverPic,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    return res.json("Updated!");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;
    if (!searchTerm) {
      return res.status(400).json("Search term is required");
    }
    const users = await User.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
      ],
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error: ", error);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const userId = userInfo.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    let suggestedUsers = [];

    // Construct the match query to exclude the current user's ID
    const matchQuery = { _id: { $ne: userId } };

    if (user.following && user.following.length > 0) {
      // If the user is following others, exclude the followed users from the suggested list as well
      matchQuery._id.$nin = user.following;
    }

    // Find random users based on the match query
    suggestedUsers = await User.aggregate([
      { $match: matchQuery },
      { $sample: { size: 2 } },
    ]);

    return res.json(suggestedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const updateOnlineStatus = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const userId = userInfo.id;
    const { online } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { online },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    return res.json({ message: "Online status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const getOnlineFollowedUsers = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const userId = userInfo.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const followedUserIds = user.following;
    if (followedUserIds?.length === 0) {
      return res.json("");
    }

    const onlineFollowedUsers = await User.find({
      _id: { $in: followedUserIds },
      online: true,
    });

    return res.json(onlineFollowedUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword);
  res.send(users);

  if (!user) {
    res.send("user not found");
  }
});
