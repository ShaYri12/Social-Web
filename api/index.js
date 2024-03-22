import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import storyRoutes from "./routes/stories.js";
import relationshipRoutes from "./routes/relationships.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import http from "http"; // Import http module for creating the server
import { Server } from "socket.io"; // Import Server class from socket.io

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express app
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
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
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);


const PORT = 8800;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});