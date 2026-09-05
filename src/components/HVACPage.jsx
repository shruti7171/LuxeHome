import React, { useState, useEffect } from 'react';
import './HVACPage.css';
import { getApiUrl } from '../config/api';

const HVACPage = ({ onBack, onServiceSelect }) => {
  const [hvacServices, setHvacServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/hvac'))
      .then(res => res.json())
      .then(data => {
        setHvacServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="hvac-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Book Service</button>
        </div>
      </nav>

      <header className="hvac-header">
        <div className="container">
          <h1 className="gradient-text">Premium HVAC Services</h1>
          <p>Total climate control and air quality solutions for your luxury residence.</p>
        </div>
      </header>

      <section className="hvac-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="hvac-grid">
              {hvacServices.map((service, index) => (
                <div key={index} className="hvac-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="hvac-img-wrapper">
                    
                  </div>
                  <div className="hvac-info">
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

export default HVACPage;
