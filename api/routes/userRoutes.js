import express from "express";
import { allUsers } from "../controllers/userControllers.js";
// import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(allUsers);

export default router;
