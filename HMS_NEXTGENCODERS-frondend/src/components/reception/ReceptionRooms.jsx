import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ReceptionRooms.css";

export default function ReceptionRooms() {
  const [rooms, setRooms] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [statusOptions] = useState(['Booked', 'Vacant', 'Occupied', 'Out of Service']);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    setLoading(true);
    setError(null);
    axios.get("http://localhost:8000/api/rooms")
      .then(res => {
        if (res.data.success && res.data.rooms) {
          const grouped = {};
          res.data.rooms.forEach(room => {
            const key = `${room.RType || 'Unknown'} - ${room.RClass || 'Unknown'}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(room);
          });
          setRooms(grouped);
          
          const initialExpanded = {};
          Object.keys(grouped).forEach(key => {
            initialExpanded[key] = true;
          });
          setExpandedGroups(initialExpanded);
        } else {
          setError("No rooms data received");
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms");
        setLoading(false);
      });
  };

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  const getStatusColor = (status) => {
    if (!status) return 'status-other';
    switch (status.toLowerCase()) {
      case 'occupied': return 'status-occupied';
      case 'vacant': return 'status-vacant';
      case 'booked': return 'status-booked';
      case 'out of service': return 'status-outofservice';
      default: return 'status-other';
    }
  };
  
  const handleStatusChange = (roomId, newStatus) => {
    // Update the backend
    axios.put(`http://localhost:8000/api/rooms/${roomId}`, { RStatus: newStatus })
      .then(res => {
        if (res.data.success) {
          // Update local state immediately for better UX
          setRooms(prevRooms => {
            const updatedRooms = { ...prevRooms };
            Object.keys(updatedRooms).forEach(group => {
              updatedRooms[group] = updatedRooms[group].map(room => 
                room._id === roomId ? { ...room, RStatus: newStatus } : room
              );
            });
            return updatedRooms;
          });
        } else {
          console.error("Failed to update room status");
          alert("Failed to update room status");
        }
      })
      .catch(err => {
        console.error("Error updating room status:", err);
        alert("Error updating room status");
      });
  };

  const startEditing = (room) => {
    setEditingRoom(room);
  };

  const cancelEditing = () => {
    setEditingRoom(null);
  };

  const saveStatus = (roomId, newStatus) => {
    handleStatusChange(roomId, newStatus);
    setEditingRoom(null);
  };

  const filteredGroups = () => {
    const filtered = {};
    
    Object.keys(rooms).forEach(group => {
      const filteredRooms = rooms[group].filter(room => {
        const roomNo = room.RoomNo ? room.RoomNo.toString() : '';
        const matchesSearch = roomNo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const roomType = room.RType ? room.RType.toLowerCase() : '';
        const matchesType = typeFilter === "all" || 
                          (typeFilter === "single" && roomType.includes("single")) ||
                          (typeFilter === "double" && roomType.includes("double"));
        
        const roomStatus = room.RStatus ? room.RStatus.toLowerCase() : '';
        const matchesStatus = statusFilter === "all" || 
                             roomStatus === statusFilter.toLowerCase();
        
        return matchesSearch && matchesType && matchesStatus;
      });
      
      if (filteredRooms.length > 0) {
        filtered[group] = filteredRooms;
      }
    });
    
    return filtered;
  };

  if (loading) return <div className="loading-spinner">Loading rooms...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  const filtered = filteredGroups();
  
  if (Object.keys(rooms).length === 0) return <div className="no-rooms">No rooms available</div>;

  return (
    <div className="rooms-container">
      <h2 className="rooms-header">Hotel Room Inventory</h2>
      
      <div className="filter-controls active-filter-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <div className={`filter-group ${typeFilter !== "all" ? "active-group" : ""}`}>
            <span className="filter-label">Type:</span>
            <button 
              className={`filter-btn ${typeFilter === "all" ? "active" : ""}`}
              onClick={() => setTypeFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${typeFilter === "single" ? "active" : ""}`}
              onClick={() => setTypeFilter("single")}
            >
              Single
            </button>
            <button 
              className={`filter-btn ${typeFilter === "double" ? "active" : ""}`}
              onClick={() => setTypeFilter("double")}
            >
              Double
            </button>
          </div>
          
          <div className={`filter-group ${statusFilter !== "all" ? "active-group" : ""}`}>
            <span className="filter-label">Status:</span>
            <button 
              className={`filter-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${statusFilter === "vacant" ? "active" : ""}`}
              onClick={() => setStatusFilter("vacant")}
            >
              Vacant
            </button>
            <button 
              className={`filter-btn ${statusFilter === "occupied" ? "active" : ""}`}
              onClick={() => setStatusFilter("occupied")}
            >
              Occupied
            </button>
            <button 
              className={`filter-btn ${statusFilter === "booked" ? "active" : ""}`}
              onClick={() => setStatusFilter("booked")}
            >
              Booked
            </button>
            <button 
              className={`filter-btn ${statusFilter === "out of service" ? "active" : ""}`}
              onClick={() => setStatusFilter("out of service")}
            >
              Out of Service
            </button>
          </div>
        </div>
      </div>
      
      {Object.keys(filtered).length === 0 ? (
        <div className="no-results">No rooms match your filters</div>
      ) : (
        Object.keys(filtered).map((group, i) => (
          <div key={i} className="room-category">
            <div 
              className="category-header"
              onClick={() => toggleGroup(group)}
            >
              <h3>
                {group} 
                <span className="room-count">({filtered[group].length} rooms)</span>
              </h3>
              <span className="toggle-icon">
                {expandedGroups[group] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedGroups[group] && (
              <div className="room-table-container">
                <table className="room-table">
                  <thead>
                    <tr>
                      <th>Room No</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered[group].map(room => (
                      <tr key={room._id} className="room-row">
                        <td className="room-number">
                          {room.RoomNo ? `R${room.RoomNo}` : "No Room-No"}
                        </td>
                        <td className="room-type">{room.RType || "No Type"}</td>
                        <td>
                          {editingRoom?._id === room._id ? (
                            <select
                              className="status-select"
                              defaultValue={room.RStatus}
                              onChange={(e) => saveStatus(room._id, e.target.value)}
                            >
                              {statusOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : (
                            <span 
                              className={`status-badge ${getStatusColor(room.RStatus)}`}
                              onClick={() => startEditing(room)}
                              style={{ cursor: 'pointer' }}
                            >
                              {room.RStatus || "No Status"}
                            </span>
                          )}
                        </td>
                        <td className="room-price">
                          {room.Price ? `$${room.Price.toLocaleString()}` : "No Price"}
                        </td>
                        <td className="room-actions">
                          {editingRoom?._id === room._id ? (
                            <button 
                              className="action-btn cancel-btn"
                              onClick={cancelEditing}
                            >
                              Cancel
                            </button>
                          ) : (
                            <button 
                              className="action-btn edit-btn"
                              onClick={() => startEditing(room)}
                            >
                              Edit Status
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}