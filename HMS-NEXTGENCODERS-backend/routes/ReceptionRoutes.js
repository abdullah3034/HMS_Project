import express from "express";
import {
  getLatestReception,
  addReception
} from "../controllers/ReceptionController.js";

const router = express.Router();

router.get("/latest", getLatestReception);
router.post("/", addReception);

export default router;
