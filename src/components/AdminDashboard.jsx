import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { getApiUrl } from '../config/api';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'services', 'users'
  
  // Data States
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form/Modal States for Service Add/Edit
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    full_description: '',
    price: '',
    duration: '',
    image_url: ''
  });

  const adminHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': 'admin'
  };

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Categories (public API)
      const catRes = await fetch(getApiUrl('/api/categories'));
      const catData = await catRes.json();
      setCategories(catData);

      // Fetch Bookings (Admin only)
      const bookRes = await fetch(getApiUrl('/api/bookings'), { headers: adminHeaders });
      if (bookRes.ok) {
        const bookData = await bookRes.json();
        setBookings(bookData);
      } else {
        setError('Failed to fetch bookings.');
      }

      // Fetch Services (public API, we added GET all services)
      const servRes = await fetch(getApiUrl('/api/services'));
      if (servRes.ok) {
        const servData = await servRes.json();
        setServices(servData);
      }

      // Fetch Users (Admin only)
      const userRes = await fetch(getApiUrl('/api/users'), { headers: adminHeaders });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData);
      }
    } catch (err) {
      setError('Connection failure. Make sure server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- BOOKING OPERATIONS ---
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/bookings/${bookingId}`), {
        method: 'DELETE'
      });
      if (res.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      } else {
        alert('Failed to delete booking.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // --- SERVICE OPERATIONS ---
  const handleServiceFormChange = (e) => {
    setServiceFormData({ ...serviceFormData, [e.target.name]: e.target.value });
  };

  const handleOpenAddService = () => {
    setIsEditingService(false);
    setEditingServiceId(null);
    setServiceFormData({
      category_id: categories[0]?.id || '',
      title: '',
      description: '',
      full_description: '',
      price: '',
      duration: '',
      image_url: ''
    });
    setShowServiceForm(true);
  };

  const handleOpenEditService = (service) => {
    setIsEditingService(true);
    setEditingServiceId(service.id);
    setServiceFormData({
      category_id: service.category_id,
      title: service.title,
      description: service.description || '',
      full_description: service.full_description || '',
      price: service.price || '',
      duration: service.duration || '',
      image_url: service.image_url || ''
    });
    setShowServiceForm(true);
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isEditingService 
      ? getApiUrl(`/api/services/${editingServiceId}`) 
      : getApiUrl('/api/services');
    const method = isEditingService ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: adminHeaders,
        body: JSON.stringify(serviceFormData)
      });
      
      if (res.ok) {
        setShowServiceForm(false);
        fetchData(); // Refresh services
      } else {
        const errorData = await res.json();
        alert(`Operation failed: ${errorData.message || 'Error occurred'}`);
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Delete this service permanently?')) return;
    try {
      const res = await fetch(getApiUrl(`/api/services/${serviceId}`), {
        method: 'DELETE',
        headers: adminHeaders
      });
      if (res.ok) {
        setServices(services.filter(s => s.id !== serviceId));
      } else {
        alert('Failed to delete service.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // --- USER OPERATIONS ---
  const handleToggleUserRole = async (targetUser) => {
    if (targetUser.id === user.id) {
      alert('You cannot change your own admin role.');
      return;
    }
    const newRole = targetUser.role === 'admin' ? 'client' : 'admin';
    try {
      const res = await fetch(getApiUrl(`/api/users/${targetUser.id}/role`), {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      } else {
        alert('Failed to update role.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const handleDeleteUser = async (targetUserId) => {
    if (targetUserId === user.id) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user permanently? This cannot be undone.')) return;
    try {
      const res = await fetch(getApiUrl(`/api/users/${targetUserId}`), {
        method: 'DELETE',
        headers: adminHeaders
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== targetUserId));
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="admin-container">
      {/* Navbar */}
      <nav className="admin-navbar glass">
        <div className="admin-nav-content">
          <div className="admin-logo gradient-text">LuxeHome Admin</div>
          <div className="admin-nav-actions">
            <span className="admin-name-tag">Admin: <strong>{user?.username}</strong></span>
            <button className="btn-logout" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="admin-layout">
        {/* Sidebar */}
        <aside className="admin-sidebar glass">
          <div className="sidebar-menu">
            <button 
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              📅 Bookings ({bookings.length})
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'services' ? 'active' : ''}`}
              onClick={() => setActiveTab('services')}
            >
              ✨ Services ({services.length})
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 Users ({users.length})
            </button>
          </div>
          <div className="sidebar-footer">
            <button className="sidebar-link refresh-btn" onClick={fetchData}>🔄 Refresh Data</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          {error && <div className="admin-error-box">{error}</div>}
          
          {loading ? (
            <div className="loading">Updating dashboard metrics...</div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="overview-tab">
                  <h1 className="tab-title gradient-text">System Overview</h1>
                  
                  {/* KPI Cards */}
                  <div className="kpi-grid">
                    <div className="kpi-card glass" onClick={() => setActiveTab('bookings')}>
                      <div className="kpi-icon yellow">📅</div>
                      <div className="kpi-info">
                        <h3>{bookings.length}</h3>
                        <p>Total Bookings</p>
                      </div>
                    </div>
                    <div className="kpi-card glass" onClick={() => setActiveTab('users')}>
                      <div className="kpi-icon blue">👥</div>
                      <div className="kpi-info">
                        <h3>{users.length}</h3>
                        <p>Registered Users</p>
                      </div>
                    </div>
                    <div className="kpi-card glass" onClick={() => setActiveTab('services')}>
                      <div className="kpi-icon green">✨</div>
                      <div className="kpi-info">
                        <h3>{services.length}</h3>
                        <p>Active Services</p>
                      </div>
                    </div>
                    <div className="kpi-card glass">
                      <div className="kpi-icon purple">🎨</div>
                      <div className="kpi-info">
                        <h3>{categories.length}</h3>
                        <p>Categories</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Activity Section */}
                  <div className="quick-activity-grid">
                    <div className="activity-box glass">
                      <h3>Recent Bookings</h3>
                      {bookings.slice(0, 5).length === 0 ? (
                        <p className="no-data">No bookings recorded yet.</p>
                      ) : (
                        <ul className="activity-list">
                          {bookings.slice(0, 5).map(b => (
                            <li key={b.id}>
                              <div>
                                <strong>{b.service_title}</strong> by {b.user_name || b.user_email}
                              </div>
                              <span className={`status-badge-sm ${b.status.toLowerCase().replace(/\s+/g, '-')}`}>{b.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="activity-box glass">
                      <h3>New Users</h3>
                      {users.slice(-5).length === 0 ? (
                        <p className="no-data">No users registered.</p>
                      ) : (
                        <ul className="activity-list">
                          {users.slice(-5).map(u => (
                            <li key={u.id}>
                              <div>
                                <strong>{u.username}</strong> ({u.email})
                              </div>
                              <span className="user-role-badge">{u.role}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="bookings-tab">
                  <h1 className="tab-title gradient-text">Bookings Management</h1>
                  <div className="table-wrapper glass">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Client Name</th>
                          <th>Client Email</th>
                          <th>Service Requested</th>
                          <th>Booking Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.id}>
                            <td>#{b.id}</td>
                            <td className="bold">{b.user_name || 'Guest'}</td>
                            <td>{b.user_email}</td>
                            <td className="bold primary-color">{b.service_title}</td>
                            <td>{formatDate(b.booking_date)}</td>
                            <td>
                              <select 
                                className={`status-select ${b.status.toLowerCase().replace(/\s+/g, '-')}`}
                                value={b.status} 
                                onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td>
                              <button className="btn-table-delete" onClick={() => handleDeleteBooking(b.id)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: SERVICES */}
              {activeTab === 'services' && (
                <div className="services-tab">
                  <div className="tab-header-actions">
                    <h1 className="tab-title gradient-text">Services Catalog</h1>
                    <button className="btn-primary" onClick={handleOpenAddService}>+ Add New Service</button>
                  </div>

                  {showServiceForm && (
                    <div className="service-form-modal glass">
                      <div className="modal-header">
                        <h2>{isEditingService ? 'Edit Service' : 'Add New Service'}</h2>
                        <button className="btn-close" onClick={() => setShowServiceForm(false)}>×</button>
                      </div>
                      <form onSubmit={handleServiceSubmit} className="modal-form">
                        <div className="form-row-two">
                          <div className="form-group">
                            <label>Service Title</label>
                            <input 
                              type="text" 
                              name="title" 
                              value={serviceFormData.title} 
                              onChange={handleServiceFormChange} 
                              placeholder="e.g. Sofa Cleaning" 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label>Category</label>
                            <select 
                              name="category_id" 
                              value={serviceFormData.category_id} 
                              onChange={handleServiceFormChange} 
                              required
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="form-row-two">
                          <div className="form-group">
                            <label>Price</label>
                            <input 
                              type="text" 
                              name="price" 
                              value={serviceFormData.price} 
                              onChange={handleServiceFormChange} 
                              placeholder="e.g. $49 or From $129" 
                              required 
                            />
                          </div>
                          <div className="form-group">
                            <label>Duration</label>
                            <input 
                              type="text" 
                              name="duration" 
                              value={serviceFormData.duration} 
                              onChange={handleServiceFormChange} 
                              placeholder="e.g. 2 Hours or 2-4 Weeks" 
                              required 
                            />
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Short Description</label>
                          <input 
                            type="text" 
                            name="description" 
                            value={serviceFormData.description} 
                            onChange={handleServiceFormChange} 
                            placeholder="A concise summary of the service" 
                            required 
                          />
                        </div>

                        <div className="form-group">
                          <label>Full Detailed Description</label>
                          <textarea 
                            name="full_description" 
                            value={serviceFormData.full_description} 
                            onChange={handleServiceFormChange} 
                            rows="4" 
                            placeholder="Comprehensive description of the service features, products used, and steps involved."
                            required
                          ></textarea>
                        </div>

                        <div className="form-group">
                          <label>Image URL</label>
                          <input 
                            type="url" 
                            name="image_url" 
                            value={serviceFormData.image_url} 
                            onChange={handleServiceFormChange} 
                            placeholder="https://images.unsplash.com/..." 
                            required 
                          />
                        </div>

                        <div className="modal-actions">
                          <button type="button" className="btn-secondary" onClick={() => setShowServiceForm(false)}>Cancel</button>
                          <button type="submit" className="btn-primary">{isEditingService ? 'Save Changes' : 'Create Service'}</button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="table-wrapper glass">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Category</th>
                          <th>Title</th>
                          <th>Price</th>
                          <th>Duration</th>
                          <th>Short Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(s => (
                          <tr key={s.id}>
                            <td>#{s.id}</td>
                            <td><span className="service-category-badge">{s.category_name || 'General'}</span></td>
                            <td className="bold">{s.title}</td>
                            <td className="bold primary-color">{s.price}</td>
                            <td>{s.duration}</td>
                            <td className="truncate">{s.description}</td>
                            <td>
                              <div className="action-btns-group">
                                <button className="btn-table-edit" onClick={() => handleOpenEditService(s)}>Edit</button>
                                <button className="btn-table-delete" onClick={() => handleDeleteService(s.id)}>Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: USERS */}
              {activeTab === 'users' && (
                <div className="users-tab">
                  <h1 className="tab-title gradient-text">User Administration</h1>
                  <div className="table-wrapper glass">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Username</th>
                          <th>Email Address</th>
                          <th>Role</th>
                          <th>Registered Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id}>
                            <td>#{u.id}</td>
                            <td className="bold">{u.username}</td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`role-badge ${u.role}`}>
                                {u.role}
                              </span>
                            </td>
                            <td>{formatDate(u.created_at)}</td>
                            <td>
                              <div className="action-btns-group">
                                <button 
                                  className={`btn-table-role ${u.role === 'admin' ? 'demote' : 'promote'}`}
                                  onClick={() => handleToggleUserRole(u)}
                                  disabled={u.id === user.id}
                                >
                                  {u.role === 'admin' ? 'Make Client' : 'Make Admin'}
                                </button>
                                <button 
                                  className="btn-table-delete" 
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={u.id === user.id}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
