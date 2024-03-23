import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import storyRoutes from "./routes/stories.js";
import relationshipRoutes from "./routes/relationships.js";

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://uzair:uzair123@api.cpammnv.mongodb.net/Chattinger?retryWrites=true&w=majority&appName=API", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB database");
});

//middlewares
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});
app.use(express.json({ limit: '3mb' }));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

//storing
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ 
  storage: storage,
  limits: {
     fieldSize: '510mb',
  } 
});


//routes
app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log("uploading")
  res.status(200).json(req.file.filename);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/relationships", relationshipRoutes);


const PORT = 8800;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
