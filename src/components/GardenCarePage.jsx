import React, { useState, useEffect } from 'react';
import './GardenCarePage.css';
import { getApiUrl } from '../config/api';

const GardenCarePage = ({ onBack, onServiceSelect }) => {
  const [gardenServices, setGardenServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/garden'))
      .then(res => res.json())
      .then(data => {
        setGardenServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="garden-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Schedule Visit</button>
        </div>
      </nav>

      <header className="garden-header">
        <div className="container">
          <h1 className="gradient-text">Premium Garden Care</h1>
          <p>Nurturing your outdoor sanctuary with expert landscaping and maintenance.</p>
        </div>
      </header>

      <section className="garden-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="garden-grid">
              {gardenServices.map((service, index) => (
                <div key={index} className="garden-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="garden-img-wrapper">
                    <img src={service.image_url} alt={service.title} className="garden-img" />
                  </div>
                  <div className="garden-info">
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

export default GardenCarePage;
