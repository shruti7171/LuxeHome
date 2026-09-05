import React, { useState } from 'react';
import './ServiceDetailPage.css';
import { getApiUrl } from '../config/api';

const ServiceDetailPage = ({ serviceData, user, onBack }) => {
  const [bookingStatus, setBookingStatus] = useState('');

  if (!serviceData) return null;

  const handleBook = async () => {
    setBookingStatus('Booking...');
    try {
      const response = await fetch(getApiUrl('/api/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          service_id: serviceData.id,
          service_title: serviceData.title,
          user_email: user?.email || 'guest@example.com'
        })
      });

      if (response.ok) {
        setBookingStatus('Booking Successful!');
        setTimeout(() => setBookingStatus(''), 3000);
      } else {
        setBookingStatus('Booking Failed. Try again.');
      }
    } catch (err) {
      setBookingStatus('Network Error.');
    }
  };

  return (
    <div className="service-detail-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <div className="logo gradient-text">LuxeHome</div>
        </div>
      </nav>

      <div className="container detail-wrapper">
        <div className="detail-grid">
          <div className="detail-image-section">
            <img src={serviceData.image_url} alt={serviceData.title} className="main-detail-img glass" />
          </div>
          
          <div className="detail-info-section glass">
            <h1 className="gradient-text">{serviceData.title}</h1>
            <p className="detail-description">{serviceData.full_description || serviceData.description}</p>
            
            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Starting From</span>
                <span className="meta-value price">{serviceData.price}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Estimated Duration</span>
                <span className="meta-value">{serviceData.duration || '2-4 Hours'}</span>
              </div>
            </div>

            <div className="contact-info-box">
              <h3>Support & Inquiry</h3>
              <p>📞 +1 (800) LUXE-HOME</p>
              <p>✉️ concierge@luxehome.com</p>
            </div>

            {bookingStatus && <div className="booking-status">{bookingStatus}</div>}

            <div className="detail-actions">
              <button className="btn-primary btn-large" onClick={handleBook} disabled={bookingStatus === 'Booking...'}>
                {bookingStatus === 'Booking...' ? 'Processing...' : 'Book Now'}
              </button>
              <button className="btn-secondary btn-large">Download Brochure</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container footer-bottom">
          <p>&copy; 2026 LuxeHome. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ServiceDetailPage;
