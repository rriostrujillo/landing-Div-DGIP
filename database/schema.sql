-- ============================================
-- Portal de Divulgación de la Ciencia — DGIP UNACH
-- MariaDB Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS dgip_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dgip_portal;

-- --------------------------------------------
-- Users table (Super Admin, Admin, Editor)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('super_admin', 'admin', 'editor') NOT NULL DEFAULT 'editor',
  avatar VARCHAR(255) DEFAULT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------
-- Categories
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT DEFAULT NULL,
  color VARCHAR(7) DEFAULT '#192D63',
  icon VARCHAR(50) DEFAULT NULL,
  sort_order INT UNSIGNED DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------
-- Posts (articles)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(350) NOT NULL UNIQUE,
  excerpt TEXT DEFAULT NULL,
  content LONGTEXT NOT NULL,
  cover_image VARCHAR(500) DEFAULT NULL,
  category_id INT UNSIGNED DEFAULT NULL,
  author_id INT UNSIGNED NOT NULL,
  status ENUM('draft', 'published', 'featured', 'archived') NOT NULL DEFAULT 'draft',
  views INT UNSIGNED DEFAULT 0,
  published_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  INDEX idx_category (category_id)
) ENGINE=InnoDB;

-- --------------------------------------------
-- Media library
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT UNSIGNED NOT NULL DEFAULT 0,
  path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500) DEFAULT NULL,
  alt_text VARCHAR(300) DEFAULT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_mime (mime_type)
) ENGINE=InnoDB;

-- --------------------------------------------
-- Attachments (post <-> media relationship)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id INT UNSIGNED NOT NULL,
  media_id INT UNSIGNED NOT NULL,
  sort_order INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
  UNIQUE KEY uk_post_media (post_id, media_id)
) ENGINE=InnoDB;

-- --------------------------------------------
-- Site settings (key-value store)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------
-- Default data
-- --------------------------------------------
INSERT INTO settings (setting_key, setting_value) VALUES
  ('site_title', 'Portal de Divulgación de la Ciencia — DGIP UNACH'),
  ('site_description', 'Portal de divulgación científica de la Dirección General de Investigación y Posgrado de la Universidad Autónoma de Chiapas'),
  ('contact_email', 'dgip@unach.mx'),
  ('footer_text', 'Universidad Autónoma de Chiapas — Dirección General de Investigación y Posgrado');

INSERT INTO categories (name, slug, color, sort_order) VALUES
  ('Investigación', 'investigacion', '#192D63', 1),
  ('Posgrado', 'posgrado', '#2A4080', 2),
  ('Innovación', 'innovacion', '#D4B012', 3),
  ('Eventos', 'eventos', '#735920', 4),
  ('Convocatorias', 'convocatorias', '#0F1B3D', 5);
