import React, { useState, useEffect } from "react";
import axios from "axios";

const RoomSelectionForm = ({
  selectedReservation,
  selectedRooms,
  setSelectedRooms
}) => {
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("all");
  const [roomClassFilter, setRoomClassFilter] = useState("all");
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueClasses, setUniqueClasses] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/rooms");
        const roomsData = response.data.rooms || response.data;
        
        // Filter to show only vacant rooms
        const vacantRooms = roomsData.filter(room => 
          room.RStatus && room.RStatus.toLowerCase() === 'vacant'
        );
        
        setRooms(vacantRooms);
        
        // Extract unique types and classes from vacant rooms only
        const types = [...new Set(vacantRooms.map(room => room.RType))];
        const classes = [...new Set(vacantRooms.map(room => room.RClass))];
        setUniqueTypes(types);
        setUniqueClasses(classes);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (roomNo) => {
    if (selectedRooms.includes(roomNo)) {
      setSelectedRooms(selectedRooms.filter(room => room !== roomNo));
    } else {
      setSelectedRooms([...selectedRooms, roomNo]);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const typeMatch = roomTypeFilter === "all" || 
                      room.RType.toLowerCase().includes(roomTypeFilter.toLowerCase());
    const classMatch = roomClassFilter === "all" || 
                       room.RClass.toLowerCase().includes(roomClassFilter.toLowerCase());
    const searchMatch = searchQuery === "" || 
                        room.RoomNo.toString().includes(searchQuery) || 
                        room.RType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        room.RClass.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && classMatch && searchMatch;
  });

  // Calculate total price for selected rooms
  const calculateTotalPrice = () => {
    return selectedRooms.reduce((total, roomNo) => {
      const room = rooms.find(r => r.RoomNo === roomNo);
      return total + (room?.RPrice || 0);
    }, 0);
  };

  // Format price for display
  const formatPrice = (price) => {
    if (!price || price === 0) return "N/A";
    return `${price.toLocaleString()}`;
  };

  return (
    <div className="checkinform-form-container">
      <h1 className="checkinform-form-heading">Search For Rooms</h1>
      
      <div className="room-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Room no, type, or class"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <label>Filter by type:</label>
            <select 
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Filter by class:</label>
            <select 
              value={roomClassFilter}
              onChange={(e) => setRoomClassFilter(e.target.value)}
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="rooms-table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Room No.</th>
                <th>Type</th>
                <th>Class</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.length > 0 ? (
                filteredRooms.map(room => (
                  <tr key={room._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRooms.includes(room.RoomNo)}
                        onChange={() => handleRoomSelect(room.RoomNo)}
                      />
                    </td>
                    <td>{room.RoomNo}</td>
                    <td>{room.RType}</td>
                    <td>{room.RClass}</td>
                    <td className="price-cell">{formatPrice(room.RPrice)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-rooms">No vacant rooms match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {selectedRooms.length > 0 && (
          <div className="selected-rooms">
            <h3>Selected Rooms: {selectedRooms.join(", ")}</h3>
            <div className="total-price">
              <strong>Total Price: {formatPrice(calculateTotalPrice())}</strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomSelectionForm;