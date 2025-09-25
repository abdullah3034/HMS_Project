import Room from "../models/RoomsModel.js";

export const getPosts = (req, res) => {
  res.send('Posts from controller');
};

// Create a new room
export const createRoom = async (req, res) => {
    console.log("Incoming data:", req.body);
    try {
        const existingRoom = await Room.findOne({ RoomNo: req.body.RoomNo });
        if (existingRoom) {
            return res.status(400).json({ success: false, message: "Room-No must be unique!" });
        }

        const newRoom = new Room(req.body);
        await newRoom.save();
        console.log("Room saved to DB:", newRoom);
        res.status(201).json({ success: true, message: "Room added successfully!" });
    } catch (err) {
        console.error("Error saving room:", err);
        res.status(500).json({ success: false, message: "Server error!" });
    }
};

// Get all rooms
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.status(200).json({ success: true, rooms });
    } catch (err) {
        console.error("GET /rooms error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get room by ID
export const getRoomById = async (req, res) => {
    const { id } = req.params;
    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ success: false, error: "Room not found" });
        }
        return res.status(200).json({ success: true, room });
    } catch (err) {
        console.error(`Error fetching room with ID ${id}:`, err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update room
export const updateRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedRoom = await Room.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedRoom) {
            return res.status(404).json({ success: false, error: "Room not found" });
        }
        return res.status(200).json({ success: true, message: "Room updated successfully", room: updatedRoom });
    } catch (err) {
        console.error(`Error updating room with ID ${id}:`, err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

// Delete room
export const deleteRoom = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRoom = await Room.findByIdAndDelete(id);
        if (!deletedRoom) {
            return res.status(404).json({ success: false, error: "Room not found" });
        }
        return res.status(200).json({ success: true, message: "Room deleted successfully" });
    } catch (err) {
        console.error(`Error deleting room with ID ${id}:`, err);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
}
