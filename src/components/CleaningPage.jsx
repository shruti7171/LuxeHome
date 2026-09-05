import React, { useState, useEffect } from 'react';
import './CleaningPage.css';
import { getApiUrl } from '../config/api';

const CleaningPage = ({ onBack, onServiceSelect }) => {
  const [subServices, setSubServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/cleaning'))
      .then(res => res.json())
      .then(data => {
        setSubServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="cleaning-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Book Now</button>
        </div>
      </nav>

      <header className="cleaning-header">
        <div className="container">
          <h1 className="gradient-text">Home Cleaning Services</h1>
          <p>Meticulous attention to detail for every corner of your sanctuary.</p>
        </div>
      </header>

      <section className="cleaning-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="cleaning-grid">
              {subServices.map((service, index) => (
                <div key={index} className="cleaning-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="cleaning-img-wrapper">
                    <img src={service.image_url} alt={service.title} className="cleaning-img" />
                  </div>
                  <div className="cleaning-info">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <div className="service-meta">
                      <span className="price">{service.price}</span>
                      <span className="duration">{service.duration}</span>
                    </div>
                    <button className="btn-secondary">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-bottom">
          <p>&copy; 2026 LuxeHome. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CleaningPage;
