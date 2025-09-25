import Setting from '../models/SettingsModel.js';

// GET: Fetch hotel settings
export const getSettings = async (req, res) => {
  try {
    const setting = await Setting.findOne();
    res.status(200).json(setting || {});
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update or create hotel settings
export const updateSettings = async (req, res) => {
  try {
    const data = req.body;
    console.log("Received data for saving:", data);

    let setting = await Setting.findOne();

    if (setting) {
      setting.set(data);
      await setting.save();
    } else {
      setting = new Setting(data);
      await setting.save();
    }

    console.log("Saved setting:", setting);
    res.status(200).json({ success: true, data: setting });

  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(500).json({ error: err.message });
  }
};

;