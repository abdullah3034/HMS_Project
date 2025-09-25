import SalesData from '../models/SalesModel.js';

// GET: Fetch sales data by period
export const getSalesByPeriod = async (req, res) => {
  const { period } = req.query;
  try {
    const data = await SalesData.find({ period });
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching sales data:", err);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
};

// POST: Bulk insert sales data
export const insertSalesData = async (req, res) => {
  try {
    const salesArray = req.body; // Expecting an array of sales data
    await SalesData.insertMany(salesArray);
    res.status(201).json({ message: 'Sales data inserted successfully' });
  } catch (err) {
    console.error("Error inserting sales data:", err);
    res.status(500).json({ error: 'Failed to insert sales data' });
  }
};

