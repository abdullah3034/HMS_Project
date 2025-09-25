import { NavLink } from "react-router-dom";
import "./OwnsideBar.css";
import { useState } from "react";

const OwnerSidebar = () => {
  // Manages the open/close state of the Reports submenu
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Toggles the Reports submenu visibility
  const toggleReportsMenu = () => {
    setIsReportsOpen(!isReportsOpen);
  };
  
  return (
    <div className="Ownsidebar">
      {/* Sidebar Header */}
      <h2 className="Ownsidebar-head-title">NexStay <br/>Hotel</h2><br/>

      {/* Profile Section */}
      <div className="Ownsidebar-profile">
        <a href="#"><span className="Ownsidebar-icon">👨🏻‍💼</span></a>&nbsp;Owner
      </div><br />

      {/* Navigation Links */}
      <ul className="Ownsidebar-nav">
        {/* Dashboard link */}
        <li>
          <NavLink to="/ownedashboardpg" className={({ isActive }) => (isActive ? "active" : "")}>
          📊  &nbsp;Dashboard
          </NavLink>
        </li>

        {/* Rooms link */}
        <li>
          <NavLink to="/rooms/home" className={({ isActive }) => (isActive ? "active" : "")}>
          🏠 &nbsp;Rooms
          </NavLink>
        </li>

        {/* Reports menu toggle */}
        <li>
          <div className="Ownsidebar-nav-link reports-menu" onClick={toggleReportsMenu}>
           📑 &nbsp;Reports
            <i className={`fa ${isReportsOpen ? "fa-chevron-up" : "fa-chevron-down"}`} style={{ float: "right" }}></i>
          </div>

          {/* Reports submenu links */}
          {isReportsOpen && (
            <ul className="Ownsidebar-sub-menu">
              <li>
                <NavLink to="/Transactionreportspage" className={({ isActive }) => (isActive ? "active" : "")}>
                🔁&nbsp;Transaction Reports
                </NavLink>
              </li>
              <li>
                <NavLink to="/Stockreportspage" className={({ isActive }) => (isActive ? "active" : "")}>
                💰 &nbsp;Stock Reports
                </NavLink>
              </li>
              <li>
                <NavLink to="/Checkoutpage" className={({ isActive }) => (isActive ? "active" : "")}>
                ↪️ &nbsp;Checkout Details
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        {/* Settings link */}
        <li>
          <NavLink to="/ownsettings" className={({ isActive }) => (isActive ? "active" : "")}>
          ⚙️ &nbsp;Settings
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default OwnerSidebar;