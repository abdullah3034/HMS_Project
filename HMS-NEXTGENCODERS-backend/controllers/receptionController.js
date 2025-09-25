// controllers/receptionController.js
import Reception from "../models/ReceptionModel.js";

export const getLatestReception = async (req, res) => {
  try {
    const latest = await Reception.findOne().sort({ updatedAt: -1 });

    if (!latest) {
      // No reception entries yet
      return res.status(200).json(null); // <- this is what's causing frontend error
    }
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reception data" });
  }
};

// Add or update reception data
export const addReception = async (req, res) => {
  try {
    const newReception = new Reception(req.body);
    const saved = await newReception.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: "Failed to save reception data" });
  }
}


