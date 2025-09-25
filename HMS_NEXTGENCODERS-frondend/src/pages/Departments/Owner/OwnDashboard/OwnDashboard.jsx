import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ ADD THIS LINE
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import './OwnDashboard.css';



// Define custom colors for pie chart segments
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

const OwnerDashboard = () => {
  // Define states for reception and sales data
  const [receptionData, setReceptionData] = useState([]);
  const [editData, setEditData] = useState(null);
  const [todayCheckIns, setTodayCheckIns] = useState(0);
  const [todayCheckOuts, setTodayCheckOuts] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [period, setPeriod] = useState("yearly"); // Default filter is yearly

  const fetchReceptionData = async () => {
  try {
    const res = await axios.get('http://localhost:8000/api/reception/latest');
    const data = res.data;

    if (!data) {
      console.warn('No reception data found');
      return; // stop execution
    }

    setReceptionData([
      { name: 'Booked', value: data.booked },
      { name: 'Occupied', value: data.occupied },
      { name: 'Vacant', value: data.vacant },
      { name: 'Out of Service', value: data.outOfService }
    ]);
    setTodayCheckIns(data.todayCheckIns);
    setTodayCheckOuts(data.todayCheckOuts);
    setEditData(data);
  } catch (err) {
    console.error('Error fetching reception data:', err);
  }
};

  // Fetch sales chart data based on selected period
  const fetchSalesData = async (selectedPeriod) => {
    try {
      const res = await axios.get(`http://localhost:8000/api/sales?period=${selectedPeriod}`);
      setSalesData(res.data); // Set chart data
    } catch (err) {
      console.error('Error fetching sales data:', err); 
    }
  };

  // Run fetch functions when component loads or period changes
  useEffect(() => {
    fetchReceptionData();
    fetchSalesData(period);
  }, [period]);

  // Handle dropdown value change
  const handleSalesFilterChange = (e) => {
    const selectedPeriod = e.target.value;
    setPeriod(selectedPeriod); // Update period filter
  };

  // Update state when editing values
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: Number(value) });
  };

  // Send edited data to backend
  const handleUpdate = async () => {
    try {
      await axios.post('http://localhost:8000/api/reception', editData);
      fetchReceptionData(); // Refresh data
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <div className="Owndashboard-container">
     
      {/* Display metrics */}
      {/* Metrics row (top) */}
<div className="dash-metrics-row">
  <div className="dash-metric-box">
    <div className="dash-metric-value">{todayCheckIns}</div>
    <div className="dash-metric-label">Today Check-Ins</div>
  </div>
  <div className="dash-metric-box">
    <div className="dash-metric-value">{todayCheckOuts}</div>
    <div className="dash-metric-label">Today Check-Outs</div>
  </div>
</div>

{/* Chart row (below metrics) */}
<div className="dash-chart-box">
  <div className="dash-chart-header">Reception Status Overview</div>

  <div className="chart-table-row">
    {/* Left: Pie Chart */}
    <div className="chart-column">
      <PieChart width={250} height={250}>
        <Pie data={receptionData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
          {receptionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>

    {/* Right: Line Chart */}
    <div className="chart-column">
      <LineChart width={500} height={250} data={receptionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#4BC0C0" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  </div>

  <div className="dash-update-button-container">
    <button className="dash-update-label" onClick={handleUpdate}>Update</button>
  </div>
</div>

      {/* Sales BarChart */}
      <div className="dash-chart-row">
        <div className="dash-chart-box">
          <div className="dash-chart-header">
            Sales
            {/* Dropdown for time period */}
            <select value={period} onChange={handleSalesFilterChange}>
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          <BarChart width={900} height={400} data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="sales" fill="#153279"/>
          </BarChart>
        </div>
      </div>
  </div>
  );
};

export default OwnerDashboard;