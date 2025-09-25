import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./Recsidebar.css";

const Ressidebar = () => {


  return (
    <div className="sidebar">
      <h2>NexStay Hotel</h2>
      <div className="profile">
        <a href="#"><span className="icon">👤</span></a>
        <p>Reception</p>
      </div>
      <ul>
        <li>
          <Link to="/recepdash">📊 Dashboard</Link>
        </li>
        <li>
          <Link to="/page1">📝 Create Reservation</Link>
        </li>
        <li>
          <Link to="/edit-reservation">📦 Manage Reservation</Link>
        </li>
        <li>
          <Link to="/rooms">📂 All Rooms</Link>
        </li>
        <li>
          <Link to="/dayout-create">📈 DayOut Reservation</Link>
        </li>

        
        <li>
          <Link to="/dayout-packages">📈 Package management</Link>
        </li>
        <li></li>
        <li>
          <Link to="/"><span>⏻</span> Logout </Link>
        </li>
      </ul>
    </div>
  );
};

export default Ressidebar;


