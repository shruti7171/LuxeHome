import React, { useState, useEffect } from 'react';
import './InteriorDesignPage.css';
import { getApiUrl } from '../config/api';

const InteriorDesignPage = ({ onBack, onServiceSelect }) => {
  const [designServices, setDesignServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(getApiUrl('/api/services/interior'))
      .then(res => res.json())
      .then(data => {
        setDesignServices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="interior-page">
      <nav className="navbar glass">
        <div className="container nav-content">
          <button className="back-btn" onClick={onBack}>← Back to Home</button>
          <div className="logo gradient-text">LuxeHome</div>
          <button className="btn-primary">Get a Quote</button>
        </div>
      </nav>

      <header className="interior-header">
        <div className="container">
          <h1 className="gradient-text">Premium Interior Design</h1>
          <p>Crafting bespoke living spaces that reflect your unique personality.</p>
        </div>
      </header>

      <section className="interior-grid-section">
        <div className="container">
          {loading ? (
            <div className="loading">Loading services...</div>
          ) : (
            <div className="interior-grid">
              {designServices.map((service, index) => (
                <div key={index} className="interior-block glass" onClick={() => onServiceSelect(service)}>
                  <div className="interior-img-wrapper">
                    <img src={service.image_url} alt={service.title} className="interior-img" />
                  </div>
                  <div className="interior-info">
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

export default InteriorDesignPage;
