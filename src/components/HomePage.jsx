import React from 'react';
import './HomePage.css';
import heroImg from '../assets/hero_image.png';
import { getApiUrl } from '../config/api';

const HomePage = ({ onLogout, onCleaningClick, onInteriorClick, onPlumbingClick, onGardenClick, onSecurityClick, onHVACClick, onBookingsClick }) => {
  const [expandedService, setExpandedService] = React.useState(null);
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    fetch(getApiUrl('/api/categories'))
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  const toggleService = (title) => {
    if (expandedService === title) {
      setExpandedService(null);
    } else {
      setExpandedService(title);
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar glass">
        <div className="container nav-content">
          <div className="logo gradient-text">LuxeHome</div>
          <ul className="nav-links">
            <li><a href="#services">Services</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <div className="nav-actions">
            <button className="bookings-link-btn" onClick={onBookingsClick}>My Bookings</button>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
            <button className="btn-primary" onClick={onBookingsClick}>Book Now</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="gradient-text">Elevate Your Living Experience</h1>
            <p>Premium home services tailored to your sophisticated lifestyle. From meticulous cleaning to expert design, we handle everything with care.</p>
            <div className="hero-btns">
              <button className="btn-primary">Explore Services</button>
              <button className="btn-secondary">View Portfolio</button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img src={heroImg} alt="Modern Interior" className="hero-img" />
          </div>
        </div>
      </header>

      <section id="services" className="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Premium Services</h2>
            <p>Experience the finest care for your home with our specialized solutions.</p>
          </div>
          <div className="services-grid">
            {categories.map((category, index) => {
              let icon = '✨';
              let onClick = () => {};
              
              if (category.slug === 'cleaning') { icon = '✨'; onClick = onCleaningClick; }
              else if (category.slug === 'interior') { icon = '🎨'; onClick = onInteriorClick; }
              else if (category.slug === 'plumbing') { icon = '🔧'; onClick = onPlumbingClick; }
              else if (category.slug === 'garden') { icon = '🌿'; onClick = onGardenClick; }
              else if (category.slug === 'security') { icon = '🛡️'; onClick = onSecurityClick; }
              else if (category.slug === 'hvac') { icon = '❄️'; onClick = onHVACClick; }

              return (
                <div 
                  key={index} 
                  className="service-card glass"
                  onClick={onClick}
                >
                  <div className="service-img-wrapper">
                    <img src={category.image_url} alt={category.name} className="service-card-img" />
                    <div className="service-icon-overlay">{icon}</div>
                  </div>
                  <div className="service-card-content">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <a href="#" className="service-link" onClick={(e) => e.stopPropagation()}>
                      Learn More →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="about" className="about-section glass-alt">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="gradient-text">About LuxeHome</h2>
              <p>Founded on the principles of excellence and discretion, LuxeHome is the premier destination for sophisticated homeowners seeking unparalleled care. We combine traditional craftsmanship with modern technology to deliver services that exceed expectations.</p>
              <div className="stats-grid">
                <div className="stat-item">
                  <h3>10k+</h3>
                  <p>Clients</p>
                </div>
                <div className="stat-item">
                  <h3>15+</h3>
                  <p>Years</p>
                </div>
                <div className="stat-item">
                  <h3>50+</h3>
                  <p>Experts</p>
                </div>
              </div>
            </div>
            <div className="about-image">
              <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="About LuxeHome" className="glass" />
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2>Contact Our Concierge</h2>
            <p>We are here to assist you with any inquiries or custom service requests.</p>
          </div>
          <div className="contact-grid">
            <div className="contact-info glass">
              <div className="info-item">
                <span className="icon">📍</span>
                <div>
                  <h4>Headquarters</h4>
                  <p>5th Avenue, Luxury District, NY</p>
                </div>
              </div>
              <div className="info-item">
                <span className="icon">📞</span>
                <div>
                  <h4>Call Us</h4>
                  <p>+1 (800) LUXE-HOME</p>
                </div>
              </div>
              <div className="info-item">
                <span className="icon">✉️</span>
                <div>
                  <h4>Email Us</h4>
                  <p>concierge@luxehome.com</p>
                </div>
              </div>
            </div>
            <form className="contact-form glass" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <input type="text" placeholder="Your Name" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Your Email" required />
              </div>
              <div className="form-group">
                <textarea placeholder="How can we help you?" rows="4" required></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-brand">
            <div className="logo gradient-text">LuxeHome</div>
            <p>Making luxury living effortless.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Company</h4>
              <ul>
                <li>About Us</li>
                <li>Careers</li>
                <li>Press</li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li>Help Center</li>
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 LuxeHome. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
