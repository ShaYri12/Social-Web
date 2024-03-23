import Story from "../models/storyModel.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import Relationship from "../models/relationshipModel.js"; 

export const getStories = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    // Get the IDs of users followed by the current user
    const followedUserIds = await Relationship.distinct("followedUserId", {
      followerUserId: userInfo._id,
    });

    // Include the current user's ID
    followedUserIds.push(userInfo._id);

    // Query for stories that match the user IDs and are within the last day
    const stories = await Story.aggregate([
      {
        $match: {
          userId: { $in: followedUserIds },
          createdAt: { $gte: moment().subtract(1, "day").toDate() },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
    ]);

    // Check if no stories are found
    if (stories.length === 0) {
      return res.status(404).json("No stories found for the user or their followings");
    }

    return res.status(200).json(stories);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};


export const addStory = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const newStory = new Story({
      img: req.body.img,
      createdAt: moment().toDate(),
      userId: userInfo._id,
    });

    await newStory.save();
    return res.status(200).json("Story has been created.");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const deleteStory = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const deletedStory = await Story.findOneAndDelete({
      _id: req.params._id,
      userId: userInfo._id,
    });

    if (deletedStory) {
      return res.status(200).json("Story has been deleted.");
    } else {
      return res.status(403).json("You can delete only your story!");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
