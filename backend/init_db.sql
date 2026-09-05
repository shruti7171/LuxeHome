-- Create Database
CREATE DATABASE IF NOT EXISTS luxehome;
USE luxehome;

-- Drop tables if they exist to ensure clean setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(511)
);

-- Create Services Table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    full_description TEXT,
    price VARCHAR(50),
    duration VARCHAR(100),
    image_url VARCHAR(511),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Login Logs Table
CREATE TABLE IF NOT EXISTS login_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_id INT,
    service_title VARCHAR(255),
    user_email VARCHAR(255),
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- Insert Seed Data for Categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Cleaning', 'cleaning', 'Meticulous attention to detail for every corner of your sanctuary.', 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Interior Design', 'interior', 'Transform your living spaces into masterpieces of comfort and style.', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'),
('Plumbing', 'plumbing', 'Expert solutions for all your water and drainage needs.', 'https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=800'),
('Garden Care', 'garden', 'Nurturing your outdoor spaces to bloom with beauty and life.', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800'),
('Smart Security', 'security', 'Advanced protection for your home and peace of mind.', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800'),
('HVAC Services', 'hvac', 'Climate control solutions for year-round comfort.', 'https://images.pexels.com/photos/257344/pexels-photo-257344.jpeg?auto=compress&cs=tinysrgb&w=800')
ON DUPLICATE KEY UPDATE name=VALUES(name), image_url=VALUES(image_url);

-- Insert Seed Data for Services (Cleaning)
SET @cleaning_id = (SELECT id FROM categories WHERE slug = 'cleaning');

INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@cleaning_id, 'Sofa Cleaning', 'Expert removal of stains and allergens from all types of upholstery.', 'Our premium sofa cleaning service uses advanced steam-extraction technology and eco-friendly detergents to revitalize your furniture. We specialize in deep stain removal, odor neutralization, and allergen elimination for fabric, leather, and velvet sofas.', '$49', '1.5 - 2 Hours', 'https://images.pexels.com/photos/4099467/pexels-photo-4099467.jpeg?auto=compress&cs=tinysrgb&w=800'),
(@cleaning_id, 'Carpet Cleaning', 'Deep steam cleaning to restore your carpets to their original glory.', 'Revive your carpets with our professional deep cleaning system. We penetrate deep into fibers to remove trapped dirt, pet dander, and tough stains, leaving your carpets soft, fresh, and sanitized.', '$79', '2 - 3 Hours', 'https://images.pexels.com/photos/4107101/pexels-photo-4107101.jpeg?auto=compress&cs=tinysrgb&w=800'),
(@cleaning_id, 'Kitchen Cleaning', 'Comprehensive degreasing and sanitization of your entire kitchen area.', 'A sparkling, hygienic kitchen is the heart of a healthy home. Our experts provide intensive degreasing of hobs and chimneys, deep cleaning of cabinets, and complete floor-to-ceiling sanitization using food-safe products.', '$129', '4 - 5 Hours', 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=800');
-- Insert Seed Data for Services (HVAC)
SET @hvac_id = (SELECT id FROM categories WHERE slug = 'hvac');
INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@hvac_id, 'AC Servicing', 'Deep cleaning and filter maintenance to ensure peak cooling efficiency.', 'Breathe cleaner air and save on energy bills. Our deep servicing includes filter cleaning, evaporator coil washing, and drainage clearing.', '$79', '2 Hours', 'https://images.pexels.com/photos/5412437/pexels-photo-5412437.jpeg?auto=compress&cs=tinysrgb&w=800'),
(@hvac_id, 'AC Repair', 'Comprehensive repairs and precision refrigerant charging.', 'Quick and reliable fixes for any cooling issue. We handle compressor repairs, sensor fixes, and precision gas refilling.', 'From $129', '2-4 Hours', 'https://images.pexels.com/photos/257344/pexels-photo-257344.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert Seed Data for Services (Plumbing)
SET @plumbing_id = (SELECT id FROM categories WHERE slug = 'plumbing');
INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@plumbing_id, 'Leak Repair', 'Expert detection and repair of water leaks in pipes and faucets.', 'Stop water waste and prevent damage. We use advanced acoustic leak detection and high-quality replacement parts.', '$59', '1-2 Hours', 'https://images.pexels.com/photos/2310904/pexels-photo-2310904.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert Seed Data for Services (Interior Design)
SET @interior_id = (SELECT id FROM categories WHERE slug = 'interior');
INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@interior_id, 'Luxury Living Room Design', 'Bespoke design solutions for your primary living space.', 'Transform your living room into a masterpiece of comfort and style. Our designers handle everything from spatial planning to furniture selection.', '$2499', '2-4 Weeks', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'),
(@interior_id, 'Modular Kitchen Design', 'Modern, efficient, and elegant kitchen design concepts.', 'Create the heart of your home with our modular kitchen solutions. We focus on ergonomics, high-end materials, and smart storage.', '$4999', '4-6 Weeks', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800');

-- Insert Seed Data for Services (Smart Security)
SET @security_id = (SELECT id FROM categories WHERE slug = 'security');
INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@security_id, 'CCTV Surveillance Setup', 'Advanced 4K camera systems with remote monitoring.', 'Monitor your home from anywhere in the world. We install high-definition cameras with night vision and cloud storage.', '$899', '1 Day', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=800');

-- Insert Seed Data for Services (Garden Care)
SET @garden_id = (SELECT id FROM categories WHERE slug = 'garden');
INSERT INTO services (category_id, title, description, full_description, price, duration, image_url) VALUES
(@garden_id, 'Lawn Mowing', 'Professional lawn trimming and edging for a pristine yard.', 'Keep your grass healthy and neat. Our service includes mowing, edge trimming, and removal of clippings.', '$45', '1 Hour', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=800'),
(@garden_id, 'Garden Cleanup', 'Thorough seasonal cleaning and waste removal.', 'Prepare your garden for the season with our comprehensive cleanup service.', '$129', '3-4 Hours', 'https://images.pexels.com/photos/4582452/pexels-photo-4582452.jpeg?auto=compress&cs=tinysrgb&w=800');

-- Insert Seed Data for Default Admin User (Password: '1234' hashed with bcrypt)
INSERT INTO users (username, email, password_hash, role) VALUES 
('admin', 'admin@gmail.com', '$2b$10$x1IjZEy26yy0VEgn3lQeOe91Y/pf2OGr6MKS5ybsSNxw3oS4c/WU2', 'admin')
ON DUPLICATE KEY UPDATE role='admin', password_hash=VALUES(password_hash);


