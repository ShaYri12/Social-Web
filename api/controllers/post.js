import Post from "../models/postModel.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = async (req, res) => {
  try {
    const userId = req.query.userId;
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    let query;
    let values;
    if (userId !== "undefined") {
      query = { userId: userId };
      values = [userId];
    } else {
      query = { $or: [{ userId: userInfo._id }, { userId: { $in: userInfo.following } }] };
      values = [userInfo._id];
    }

    const posts = await Post.find(query)
      .populate({ path: "userId", select: "id name profilePic" })
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const addPost = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const newPost = new Post({
      desc: req.body.desc,
      img: req.body.img,
      createdAt: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userId: userInfo._id,
    });

    await newPost.save();
    return res.status(200).json("Post has been created.");
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");

    const userInfo = jwt.verify(token, "secretkey");
    if (!userInfo) return res.status(403).json("Token is not valid!");

    const deletedPost = await Post.findOneAndDelete({
      _id: req.params._id,
      userId: userInfo._id,
    });

    if (deletedPost) {
      return res.status(200).json("Post has been deleted.");
    } else {
      return res.status(403).json("You can delete only your post.");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};
