import express from "express";
import Room from "../models/RoomsModel.js"; // ✅ Correct path to Room model

const router = express.Router();

// ✅ 1. Get ALL rooms for Reception module (view all, not just vacant)
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await Room.find(); // Full room details
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching rooms" });
  }
});

// ✅ 2. Get only RType, RClass, and Price (for grouped category view)
router.get("/room-categories", async (req, res) => {
  try {
    const rooms = await Room.find({}, "RType RClass Price");
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// ✅ 3. Reserve a room (status changes from Vacant → Booked)
router.post("/reserve", async (req, res) => {
  const { RoomNo } = req.body;

  try {
    const room = await Room.findOne({ RoomNo });

    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (room.RStatus !== "Vacant") {
      return res.status(400).json({ success: false, message: "Room is not available for booking" });
    }

    room.RStatus = "Booked";
    await room.save();

    res.json({ success: true, message: "Room reserved successfully", room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;