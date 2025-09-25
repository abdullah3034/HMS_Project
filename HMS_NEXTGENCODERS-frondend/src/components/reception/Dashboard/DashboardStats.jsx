import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DashboardStats.css";

const DashboardStats = () => {
  const [dashboardData, setDashboardData] = useState({
    totalReservations: 0,
    dayOutReservations: 0,
    overnightReservations: 0,
    todayCheckIns: [],
    todayCheckOuts: [],
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0
  });
  const [roomStatus, setRoomStatus] = useState({
    booked: 0,
    vacant: 0,
    occupied: 0,
    outOfService: 0,
    total: 0
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
    fetchRoomStatus();
    
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/reservations");
      const reservations = response.data;
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate statistics
      const dayOutCount = reservations.filter(r => r.reservationType === 'dayOut').length;
      const overnightCount = reservations.filter(r => r.reservationType === 'room').length;
      
      // Today's check-ins (reservations starting today)
      const todayCheckIns = reservations.filter(reservation => {
        const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
        return checkInDate === today;
      });
      
      // Today's check-outs (reservations ending today)
      const todayCheckOuts = reservations.filter(reservation => {
        if (reservation.reservationType === 'dayOut') {
          // For day-out, check if it's happening today
          const reservationDate = new Date(reservation.checkIn).toISOString().split('T')[0];
          return reservationDate === today;
        } else {
          // For overnight, check if checkout is today
          const checkOutDate = reservation.checkOut ? 
            new Date(reservation.checkOut).toISOString().split('T')[0] : null;
          return checkOutDate === today;
        }
      });

      // Calculate revenue
      const todayRevenue = calculateDayRevenue(reservations, today);
      const weekRevenue = calculateWeekRevenue(reservations);
      const monthRevenue = calculateMonthRevenue(reservations);

      setDashboardData({
        totalReservations: reservations.length,
        dayOutReservations: dayOutCount,
        overnightReservations: overnightCount,
        todayCheckIns,
        todayCheckOuts,
        todayRevenue,
        weekRevenue,
        monthRevenue
      });
    } catch (err) {
      setError("Error fetching dashboard data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

const fetchRoomStatus = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/rooms");
    
    // Check if the response has the nested structure like in RoomHome
    const rooms = response.data.success && Array.isArray(response.data.rooms) 
      ? response.data.rooms 
      : response.data; // Fallback to direct array if structure is different
    
    const statusCounts = {
      booked: 0,
      vacant: 0,
      occupied: 0,
      outOfService: 0,
      total: rooms.length
    };

    rooms.forEach(room => {
      // Use RStatus field (matching RoomHome component) instead of status
      const status = room.RStatus?.toLowerCase();
      
      if (status === 'booked') statusCounts.booked++;
      else if (status === 'vacant') statusCounts.vacant++;
      else if (status === 'occupied') statusCounts.occupied++;
      else if (status === 'out of service' || status === 'maintenance') statusCounts.outOfService++;
    });

    setRoomStatus(statusCounts);
  } catch (err) {
    console.error("Error fetching room status:", err);
    // Set default values on error
    setRoomStatus({
      booked: 0,
      vacant: 0,
      occupied: 0,
      outOfService: 0,
      total: 0
    });
  }
};;

  const calculateDayRevenue = (reservations, date) => {
    return reservations
      .filter(reservation => {
        const checkInDate = new Date(reservation.checkIn).toISOString().split('T')[0];
        return checkInDate === date;
      })
      .reduce((total, reservation) => total + (reservation.totalAmount || 0), 0);
  };

  const calculateWeekRevenue = (reservations) => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return reservations
      .filter(reservation => {
        const checkInDate = new Date(reservation.checkIn);
        return checkInDate >= weekAgo && checkInDate <= today;
      })
      .reduce((total, reservation) => total + (reservation.totalAmount || 0), 0);
  };

  const calculateMonthRevenue = (reservations) => {
    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return reservations
      .filter(reservation => {
        const checkInDate = new Date(reservation.checkIn);
        return checkInDate >= monthAgo && checkInDate <= today;
      })
      .reduce((total, reservation) => total + (reservation.totalAmount || 0), 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const ClockCalendar = () => {
    const timeString = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const dateString = currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="clock-calendar-container">
        <div className="digital-clock">
          <div className="time">{timeString}</div>
          <div className="date">{dateString}</div>
        </div>
      </div>
    );
  };

  const RoomStatusCard = ({ status, count, total, color, icon }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    return (
      <div className={`room-status-card ${color}`}>
        <div className="card-content">
          <div className="status-info">
            <i className={`fas ${icon} status-icon`}></i>
            <div className="status-details">
              <h3 className="status-count">{count}</h3>
              <p className="status-label">{status}</p>
            </div>
          </div>
          <div className="percentage">{percentage}%</div>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Hotel Dashboard</h1>
          <p className="dashboard-subtitle">Real-time overview of your property</p>
        </div>
        <ClockCalendar />
      </div>
      
      {/* Room Status Section */}
      <div className="room-status-section">
        <h2 className="section-title">Room Status Overview</h2>
        <div className="room-status-grid">
          <RoomStatusCard 
            status="Booked" 
            count={roomStatus.booked} 
            total={roomStatus.total}
            color="booked" 
            icon="fa-calendar-check" 
          />
          <RoomStatusCard 
            status="Vacant" 
            count={roomStatus.vacant} 
            total={roomStatus.total}
            color="vacant" 
            icon="fa-door-open" 
          />
          <RoomStatusCard 
            status="Occupied" 
            count={roomStatus.occupied} 
            total={roomStatus.total}
            color="occupied" 
            icon="fa-bed" 
          />
          <RoomStatusCard 
            status="Out of Service" 
            count={roomStatus.outOfService} 
            total={roomStatus.total}
            color="out-of-service" 
            icon="fa-tools" 
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <h2 className="section-title">Reservation Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-icon">
              <i className="fas fa-calendar-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{dashboardData.totalReservations}</h3>
              <p>Total Reservations</p>
            </div>
          </div>
          
          <div className="stat-card success">
            <div className="stat-icon">
              <i className="fas fa-bed"></i>
            </div>
            <div className="stat-content">
              <h3>{dashboardData.overnightReservations}</h3>
              <p>Overnight Stays</p>
            </div>
          </div>
          
          <div className="stat-card info">
            <div className="stat-icon">
              <i className="fas fa-sun"></i>
            </div>
            <div className="stat-content">
              <h3>{dashboardData.dayOutReservations}</h3>
              <p>Day-Out Packages</p>
            </div>
          </div>
          
          <div className="stat-card warning">
            <div className="stat-icon">
              <i className="fas fa-sign-in-alt"></i>
            </div>
            <div className="stat-content">
              <h3>{dashboardData.todayCheckIns.length}</h3>
              <p>Today's Check-ins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="revenue-section">
        <h2 className="section-title">Revenue Overview</h2>
        <div className="revenue-grid">
          <div className="revenue-card today">
            <div className="revenue-icon">
              <i className="fas fa-coins"></i>
            </div>
            <div className="revenue-content">
              <h3>{formatCurrency(dashboardData.todayRevenue)}</h3>
              <p>Today's Revenue</p>
            </div>
          </div>
          
          <div className="revenue-card week">
            <div className="revenue-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="revenue-content">
              <h3>{formatCurrency(dashboardData.weekRevenue)}</h3>
              <p>This Week's Revenue</p>
            </div>
          </div>
          
          <div className="revenue-card month">
            <div className="revenue-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <div className="revenue-content">
              <h3>{formatCurrency(dashboardData.monthRevenue)}</h3>
              <p>This Month's Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activities */}
      <div className="activities-section">
        <h2 className="section-title">Today's Activities</h2>
        <div className="activities-grid">
          {/* Today's Check-ins */}
          <div className="activity-card checkins">
            <div className="activity-header">
              <div className="activity-title">
                <i className="fas fa-sign-in-alt"></i>
                <span>Today's Check-ins</span>
              </div>
              <div className="activity-count">{dashboardData.todayCheckIns.length}</div>
            </div>
            <div className="activity-content">
              {dashboardData.todayCheckIns.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-calendar-times"></i>
                  <p>No check-ins scheduled for today</p>
                </div>
              ) : (
                <div className="activity-list">
                  {dashboardData.todayCheckIns.map((reservation, index) => (
                    <div key={index} className="activity-item">
                      <div className="guest-info">
                        <strong>{reservation.firstName} {reservation.surname}</strong>
                        <small>Adults: {reservation.adults}, Kids: {reservation.kids}</small>
                      </div>
                      <div className="reservation-details">
                        <span className={`type-badge ${reservation.reservationType}`}>
                          {reservation.reservationType === 'room' ? 'Overnight' : 'Day-Out'}
                        </span>
                        <div className="time">
                          {reservation.reservationType === 'room' 
                            ? formatDate(reservation.checkIn)
                            : formatTime(reservation.startTime)
                          }
                        </div>
                        <div className="amount">
                          {formatCurrency(reservation.totalAmount || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Today's Check-outs */}
          <div className="activity-card checkouts">
            <div className="activity-header">
              <div className="activity-title">
                <i className="fas fa-sign-out-alt"></i>
                <span>Today's Check-outs</span>
              </div>
              <div className="activity-count">{dashboardData.todayCheckOuts.length}</div>
            </div>
            <div className="activity-content">
              {dashboardData.todayCheckOuts.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-calendar-times"></i>
                  <p>No check-outs scheduled for today</p>
                </div>
              ) : (
                <div className="activity-list">
                  {dashboardData.todayCheckOuts.map((reservation, index) => (
                    <div key={index} className="activity-item">
                      <div className="guest-info">
                        <strong>{reservation.firstName} {reservation.surname}</strong>
                        <small>Adults: {reservation.adults}, Kids: {reservation.kids}</small>
                      </div>
                      <div className="reservation-details">
                        <span className={`type-badge ${reservation.reservationType}`}>
                          {reservation.reservationType === 'room' ? 'Overnight' : 'Day-Out'}
                        </span>
                        <div className="time">
                          {reservation.reservationType === 'room' 
                            ? (reservation.checkOut ? formatDate(reservation.checkOut) : 'TBD')
                            : formatTime(reservation.endTime)
                          }
                        </div>
                        <div className="amount">
                          {formatCurrency(reservation.totalAmount || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;