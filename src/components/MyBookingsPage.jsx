import React, { useEffect, useState } from 'react';
import './MyBookingsPage.css';
import { getApiUrl } from '../config/api';

const MyBookingsPage = ({ user, onBack }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl(`/api/bookings/user/${user.id}`));
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        setError('Failed to fetch bookings.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        // Refresh bookings
        fetchBookings();
      } else {
        alert('Failed to cancel booking. Please try again.');
      }
    } catch (err) {
      alert('Network error. Failed to cancel booking.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="bookings-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <div className="user-profile">
            <span>Client: <strong>{user?.username}</strong></span>
          </div>
        </div>
      </nav>

      <div className="container bookings-content">
        <div className="bookings-header">
          <h1 className="gradient-text">My Bookings History</h1>
          <p>Track, manage, or cancel your scheduled premium services.</p>
        </div>

        {error && <div className="bookings-error">{error}</div>}

        {loading ? (
          <div className="loading">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-bookings glass">
            <div className="empty-icon">📅</div>
            <h3>No Bookings Found</h3>
            <p>You haven't scheduled any luxury services yet. Explore our catalogs and elevate your experience.</p>
            <button className="btn-primary" onClick={onBack}>Browse Services</button>
          </div>
        ) : (
          <div className="bookings-table-wrapper glass">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Booked Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td className="service-name">{booking.service_title}</td>
                    <td>{formatDate(booking.booking_date)}</td>
                    <td>
                      <span className={`status-badge ${booking.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      {(booking.status === 'Pending' || booking.status === 'Confirmed') ? (
                        <button 
                          className="btn-cancel" 
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="action-na">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <footer className="footer">
        <div className="container footer-bottom">
          <p>&copy; 2026 LuxeHome. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MyBookingsPage;
