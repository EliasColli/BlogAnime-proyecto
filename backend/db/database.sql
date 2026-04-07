CREATE DATABASE IF NOT EXISTS blog_anime;
USE blog_anime;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(100) DEFAULT 'Sin Categoría',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial mockup data if desired
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin', 'admin@curator.com', '$2b$10$tZ8GZ5h/0RSTTIFM8U0rL.d.c9uHk3uX2U4k5P5C/3bO6gK5d4nZm', 'ADMIN'),
('Normal User', 'user@curator.com', '$2b$10$7Z8GZ5h/0RSTTIFM8U0rL.d.c9uHk3uX2U4k5P5C/3bO6gK5d4nZm', 'USER');
-- Hint: the password above is 'admin' and 'user' hashed but for demo purposes it will need a real register!
