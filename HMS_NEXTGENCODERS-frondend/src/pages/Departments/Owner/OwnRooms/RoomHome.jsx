import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";

import "./RoomHome.css"; // Using regular CSS, not CSS modules

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [formRoom, setFormRoom] = useState({
    RoomNo: "",
    RStatus: "",
    RType: "",
    RClass: "",
    Price: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    axios
      .get("http://localhost:8000/api/rooms")
      .then((res) => {
        if (res.data.success) {
          setRooms(res.data.rooms);
          setAllRooms(res.data.rooms);
        }
      })
      .catch((err) => {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms.");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`http://localhost:8000/api/rooms/${id}`);
        setRooms((prev) => prev.filter((room) => room._id !== id));
        setAllRooms((prev) => prev.filter((room) => room._id !== id));
        alert("Room deleted successfully.");
      } catch (error) {
        alert("Failed to delete room.");
      }
    }
  };

  const handleSearchArea = (e) => {
    const searchKey = e.target.value.toLowerCase();
    if (searchKey.trim() === "") {
      setRooms(allRooms);
    } else {
      const result = allRooms.filter((room) =>
        ["RoomNo", "RStatus", "RType", "RClass"].some((key) =>
          (room[key] || "").toString().toLowerCase().includes(searchKey)
        )
      );
      setRooms(result);
    }
  };

  const openAddModal = () => {
    setFormRoom({
      RoomNo: "",
      RStatus: "",
      RType: "",
      RClass: "",
      Price: "",
    });
    setEditMode(false);
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setFormRoom({
      RoomNo: room.RoomNo || "",
      RStatus: room.RStatus || "",
      RType: room.RType || "",
      RClass: room.RClass || "",
      Price: room.Price || "",
    });
    setEditingRoomId(room._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    setFormRoom({ ...formRoom, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:8000/api/rooms/${editingRoomId}`, formRoom);
        alert("Room updated successfully!");
      } else {
        await axios.post("http://localhost:8000/api/rooms", formRoom);
        alert("Room added successfully!");
      }
      setShowModal(false);
      fetchRooms();
    } catch (err) {
      alert("Failed to save room.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setFormRoom({ RoomNo: "", RStatus: "", RType: "", RClass: "", Price: "" });
  };

  if (loading) return <div className="roomhome-loading">Loading...</div>;
  if (error) return <div className="roomhome-error">{error}</div>;

  return (
    <div className="roomhome-container">
  

      <div className={showModal ? "roomhome-blur" : ""}>
        <div className="roomhome-header">
          <h1>Rooms List</h1>
          <input
            className="roomhome-search-input"
            type="search"
            placeholder="Search"
            onChange={handleSearchArea}
          />
        </div>

        {rooms.length === 0 ? (
          <p>No rooms available.</p>
        ) : (
          <>
            <table className="roomhome-table">
              <thead>
                <tr>
                  <th>Room-No</th>
                  <th>Room Status</th>
                  <th>Room Type</th>
                  <th>Room Class</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td>{room.RoomNo ? `R${room.RoomNo}` : "No Room-No"}</td>
                    <td>{room.RStatus || "No Status"}</td>
                    <td>{room.RType || "No Type"}</td>
                    <td>{room.RClass || "No Class"}</td>
                    <td>{room.Price ? `$${room.Price}` : "No Price"}</td>
                    <td>
                      <button className="roomhome-edit-btn" onClick={() => openEditModal(room)}>
                        <FaEdit style={{ color: "#000" }} /> <span style={{ color: "#000" }}>Edit</span>
                      </button>
                      <button className="roomhome-delete-btn" onClick={() => handleDelete(room._id)}>
                        <FaTrashAlt style={{ color: "white" }} /> <span style={{ color: "white" }}>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="roomhome-add-btn" onClick={openAddModal}>
              <FaPlus /> Add a New Room
            </button>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="roomhome-modal-overlay">
          <div className="roomhome-modal-content">
            <h2>{editMode ? "Edit Room Details" : "Add a New Room"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room-No</label>
                <input name="RoomNo" type="number" required value={formRoom.RoomNo} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Room Status</label>
                <select name="RStatus" required value={formRoom.RStatus} onChange={handleFormChange}>
                  <option value="">Select Room Status</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Booked">Booked</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
              <div className="form-group">
                <label>Room Type</label>
                <select name="RType" required value={formRoom.RType} onChange={handleFormChange}>
                  <option value="">Select Room Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                </select>
              </div>
              <div className="form-group">
                <label>Room Class</label>
                <select name="RClass" required value={formRoom.RClass} onChange={handleFormChange}>
                  <option value="">Select Room Class</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price</label>
                <input name="Price" type="number" required value={formRoom.Price} onChange={handleFormChange} />
              </div>
              <table border="none">
                <tbody>
                  <tr>
                    <td>
                      <button type="button" className="cancel-btn" onClick={closeModal}>
                        Cancel
                      </button>
                    </td>
                    <td>
                      <button type="submit" className="save-btn">
                        Save
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
