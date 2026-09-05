import React, { useState, useEffect } from 'react';
import './PlumbingPage.css';
import { getApiUrl } from '../config/api';

const PlumbingPage = ({ onBack, onServiceSelect }) => {
  const [plumbingServices, setPlumbingServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/plumbing'))
      .then(res => res.json())
      .then(data => {
        setPlumbingServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="plumbing-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Call Now</button>
        </div>
      </nav>

      <header className="plumbing-header">
        <div className="container">
          <h1 className="gradient-text">Expert Plumbing & Repair</h1>
          <p>Reliable, professional, and swift solutions for your home's vital systems.</p>
        </div>
      </header>

      <section className="plumbing-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="plumbing-grid">
              {plumbingServices.map((service, index) => (
                <div key={index} className="plumbing-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="plumbing-img-wrapper">
                    <img src={service.image_url} alt={service.title} className="plumbing-img" />
                  </div>
                  <div className="plumbing-info">
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

export default PlumbingPage;
