import React, { useState, useEffect } from 'react';
import './SmartSecurityPage.css';
import { getApiUrl } from '../config/api';

const SmartSecurityPage = ({ onBack, onServiceSelect }) => {
  const [securityServices, setSecurityServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/security'))
      .then(res => res.json())
      .then(data => {
        setSecurityServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="security-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Get Assessment</button>
        </div>
      </nav>

      <header className="security-header">
        <div className="container">
          <h1 className="gradient-text">Advanced Smart Security</h1>
          <p>Protecting your peace of mind with cutting-edge surveillance and monitoring.</p>
        </div>
      </header>

      <section className="security-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="security-grid">
              {securityServices.map((service, index) => (
                <div key={index} className="security-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="security-img-wrapper">
                    <img src={service.image_url} alt={service.title} className="security-img" />
                  </div>
                  <div className="security-info">
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

export default SmartSecurityPage;
