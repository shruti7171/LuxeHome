const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from backend/.env or root .env
if (fs.existsSync(path.join(__dirname, '.env'))) {
    require('dotenv').config({ path: path.join(__dirname, '.env') });
} else {
    require('dotenv').config();
}

const app = express();

// Configure CORS for production
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) 
    : '*';

app.use(cors({
    origin: allowedOrigins === '*' ? '*' : (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(null, true); // Permissive fallback for tunnels/production domains
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role']
}));

app.use(express.json());

// Database Connection Configuration
const getDbConfig = () => {
    if (process.env.DATABASE_URL || process.env.MYSQL_URL) {
        try {
            const rawUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
            const dbUrl = new URL(rawUrl);
            const dbName = dbUrl.pathname.replace(/^\//, '') || process.env.DB_NAME || 'test';
            return {
                host: dbUrl.hostname,
                port: dbUrl.port ? parseInt(dbUrl.port, 10) : 3306,
                user: decodeURIComponent(dbUrl.username || 'root'),
                password: decodeURIComponent(dbUrl.password || ''),
                database: dbName,
                ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false },
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            };
        } catch (e) {
            console.error('Failed to parse DATABASE_URL, falling back to individual variables:', e.message);
        }
    }

    return {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'luxehome',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
};

const db = mysql.createPool(getDbConfig());

// Automated Table and Seed Data Initialization
const initDatabase = () => {
    db.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection failed:', err.message);
            return;
        }
        console.log('Connected to LuxeHome MySQL Database.');

        const schemaQueries = [
            `CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                image_url VARCHAR(511)
            )`,
            `CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                full_description TEXT,
                price VARCHAR(50),
                duration VARCHAR(100),
                image_url VARCHAR(511),
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
            )`,
            `CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'client',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS login_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL,
                ip_address VARCHAR(45),
                login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
            `CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                service_id INT,
                service_title VARCHAR(255),
                user_email VARCHAR(255),
                booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Pending',
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
            )`
        ];

        // Execute table creations in sequence
        const runQueries = async () => {
            for (const q of schemaQueries) {
                await new Promise((resolve) => connection.query(q, () => resolve()));
            }

            // Ensure Admin exists
            const checkAdminSql = "SELECT id FROM users WHERE username = 'admin' LIMIT 1";
            connection.query(checkAdminSql, async (adminErr, adminRows) => {
                if (!adminErr && (!adminRows || adminRows.length === 0)) {
                    const hashedAdminPass = await bcrypt.hash('1234', 10);
                    const insertAdminSql = "INSERT INTO users (username, email, password_hash, role) VALUES ('admin', 'admin@gmail.com', ?, 'admin')";
                    connection.query(insertAdminSql, [hashedAdminPass], (insErr) => {
                        if (!insErr) console.log('Default admin initialized (admin / 1234)');
                    });
                }
            });

            // Ensure Categories exist
            const checkCatSql = "SELECT COUNT(*) as count FROM categories";
            connection.query(checkCatSql, (catErr, catRows) => {
                if (!catErr && catRows && catRows[0].count === 0) {
                    const seedCategories = `
                        INSERT INTO categories (name, slug, description, image_url) VALUES
                        ('Cleaning', 'cleaning', 'Meticulous attention to detail for every corner of your sanctuary.', 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'),
                        ('Interior Design', 'interior', 'Transform your living spaces into masterpieces of comfort and style.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'),
                        ('Plumbing', 'plumbing', 'Expert solutions for all your water and drainage needs.', 'https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=800'),
                        ('Garden Care', 'garden', 'Nurturing your outdoor spaces to bloom with beauty and life.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800'),
                        ('Smart Security', 'security', 'Advanced protection for your home and peace of mind.', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800'),
                        ('HVAC Services', 'hvac', 'Climate control solutions for year-round comfort.', 'https://images.pexels.com/photos/257344/pexels-photo-257344.jpeg?auto=compress&cs=tinysrgb&w=800')
                    `;
                    connection.query(seedCategories, () => {
                        console.log('Categories initialized.');
                    });
                }
            });

            connection.release();
        };

        runQueries().catch((e) => {
            console.error('Error initializing schema:', e);
            connection.release();
        });
    });
};

initDatabase();

// Middleware to authorize Admins
const requireAdmin = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
    }
};

// --- HEALTH CHECK ENDPOINT ---
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// --- API ENDPOINTS ---

// 1. Get all categories
app.get('/api/categories', (req, res) => {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 1b. Get all services
app.get('/api/services', (req, res) => {
    const sql = 'SELECT s.*, c.name as category_name FROM services s JOIN categories c ON s.category_id = c.id';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. Get services by category slug
app.get('/api/services/:slug', (req, res) => {
    const { slug } = req.params;
    const sql = `
        SELECT s.* FROM services s 
        JOIN categories c ON s.category_id = c.id 
        WHERE c.slug = ?
    `;
    db.query(sql, [slug], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 3. Edit Service
app.put('/api/services/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { title, description, full_description, price, duration, image_url } = req.body;
    const sql = `
        UPDATE services 
        SET title = ?, description = ?, full_description = ?, price = ?, duration = ?, image_url = ? 
        WHERE id = ?
    `;
    db.query(sql, [title, description, full_description, price, duration, image_url, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Service not found' });
        res.json({ success: true, message: 'Service updated successfully' });
    });
});

// 4. Delete Service
app.delete('/api/services/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM services WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Service not found' });
        res.json({ success: true, message: 'Service deleted successfully' });
    });
});

// 5. Edit Category
app.put('/api/categories/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, slug, description, image_url } = req.body;
    const sql = 'UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ? WHERE id = ?';
    db.query(sql, [name, slug, description, image_url, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ success: true, message: 'Category updated successfully' });
    });
});

// 6. Delete Category
app.delete('/api/categories/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM categories WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted successfully' });
    });
});

// 7. Create Booking
app.post('/api/bookings', (req, res) => {
    const { user_id, service_id, service_title, user_email } = req.body;
    console.log('Received booking request:', req.body);
    const sql = 'INSERT INTO bookings (user_id, service_id, service_title, user_email) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, service_id, service_title, user_email], (err, results) => {
        if (err) {
            console.error('Booking Database Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log('Booking successful:', results.insertId);
        res.json({ success: true, message: 'Booking successful', bookingId: results.insertId });
    });
});

// 8. User Signup
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
        }

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPassword = password.trim();

        if (!trimmedUsername || !trimmedEmail || !trimmedPassword) {
            return res.status(400).json({ success: false, message: 'Username, email, and password cannot be empty.' });
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(trimmedPassword, saltRounds);

        const sql = 'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, \'client\')';
        db.query(sql, [trimmedUsername, trimmedEmail, hashedPassword], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: 'Username or Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'User registered successfully', userId: results.insertId });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. User Login
app.post('/api/login', (req, res) => {
    const { username, email, password } = req.body;
    const identifier = (username || email || '').trim();
    const inputPassword = (password || '').trim();
    const ip = req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';

    if (!identifier || !inputPassword) {
        return res.status(400).json({ success: false, message: 'Please provide email/username and password.' });
    }

    const usernameParam = (username || '').trim();
    const emailParam = (email || '').trim();

    const sql = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?) LIMIT 1';
    db.query(sql, [usernameParam || identifier, usernameParam || identifier, emailParam || identifier, emailParam || identifier], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        let user = results && results.length > 0 ? results[0] : null;
        let isPasswordValid = false;

        if (user) {
            try {
                isPasswordValid = await bcrypt.compare(inputPassword, user.password_hash);
            } catch (bcErr) {
                isPasswordValid = false;
            }

            if (!isPasswordValid && user.password_hash === inputPassword) {
                isPasswordValid = true;
                bcrypt.hash(inputPassword, 10).then((newHash) => {
                    db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
                }).catch(() => {});
            }
        }

        const status = isPasswordValid ? 'Success' : 'Failed';

        const logSql = 'INSERT INTO login_logs (username, status, ip_address) VALUES (?, ?, ?)';
        db.query(logSql, [identifier, status, ip], (logErr) => {
            if (logErr) console.error('Failed to log login:', logErr.message);
        });

        if (isPasswordValid && user) {
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username/email or password' });
        }
    });
});

// 10. Add Category
app.post('/api/categories', requireAdmin, (req, res) => {
    const { name, slug, description, image_url } = req.body;
    const sql = 'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, slug, description, image_url], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Category added successfully', categoryId: results.insertId });
    });
});

// 11. Delete User
app.delete('/api/users/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM users WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Delete User Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted successfully' });
    });
});

// 12. Get All Users (Admin only)
app.get('/api/users', requireAdmin, (req, res) => {
    const sql = 'SELECT id, username, email, role, created_at FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 13. Toggle/Update User Role (Admin only)
app.put('/api/users/:id/role', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (role !== 'admin' && role !== 'client') {
        return res.status(400).json({ success: false, message: 'Invalid role value' });
    }
    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(sql, [role, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ success: true, message: 'User role updated successfully' });
    });
});

// 14. Get All Bookings (Admin only)
app.get('/api/bookings', requireAdmin, (req, res) => {
    const sql = `
        SELECT b.*, u.username as user_name 
        FROM bookings b 
        LEFT JOIN users u ON b.user_id = u.id 
        ORDER BY b.booking_date DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 15. Get User Bookings (Client & Admin)
app.get('/api/bookings/user/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT * FROM bookings WHERE user_id = ? ORDER BY booking_date DESC';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 16. Update Booking Status (Admin only)
app.put('/api/bookings/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
    db.query(sql, [status, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
        res.json({ success: true, message: 'Booking status updated successfully' });
    });
});

// 17. Delete/Cancel Booking (Client & Admin)
app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM bookings WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
        res.json({ success: true, message: 'Booking deleted successfully' });
    });
});

// 18. Add Service (Admin only)
app.post('/api/services', requireAdmin, (req, res) => {
    const { category_id, title, description, full_description, price, duration, image_url } = req.body;
    const sql = `
        INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [category_id, title, description, full_description, price, duration, image_url], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Service added successfully', serviceId: results.insertId });
    });
});

// --- PRODUCTION STATIC SPA SERVING ---
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
    console.log('Serving frontend static assets from:', distDir);
    app.use(express.static(distDir));
    
    // SPA Fallback for client routes
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distDir, 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`LuxeHome Server running on http://localhost:${PORT}`);
});

module.exports = { app, server, db };
