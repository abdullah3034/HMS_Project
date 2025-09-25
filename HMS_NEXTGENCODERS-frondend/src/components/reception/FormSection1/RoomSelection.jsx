import React from 'react';

const RoomSelection = ({
  rooms,
  selectedRooms,
  roomTypeFilter,
  roomClassFilter,
  searchQuery,
  uniqueTypes,
  uniqueClasses,
  handleRoomSelect,
  setRoomTypeFilter,
  setRoomClassFilter,
  setSearchQuery
}) => {
  // Filter rooms based on the current filter criteria
  const filteredRooms = rooms.filter(room => {
    // Convert room number to string for comparison
    const roomNoString = room.RoomNo.toString();
    
    // Apply search query filter
    const matchesSearch = 
      roomNoString.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.RType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.RClass.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply type filter
    const matchesType = 
      roomTypeFilter === 'all' ||
      room.RType === roomTypeFilter;
    
    // Apply class filter
    const matchesClass = 
      roomClassFilter === 'all' ||
      room.RClass === roomClassFilter;
    
    return matchesSearch && matchesType && matchesClass;
  });

  return (
    <div className="checkinform-form-container">
      <h2 className="checkinform-form-heading">Search For Rooms</h2>
      
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
              <th>Status</th>
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
                  <td>
                    {/* Fixed: Check both Price and RPrice fields */}
                    {room.RPrice ? `Rs. ${room.RPrice}` : 
                     room.Price ? `Rs. ${room.Price}` : 'N/A'}
                  </td>
                  <td>{room.RStatus}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-rooms">No rooms available matching your criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomSelection;