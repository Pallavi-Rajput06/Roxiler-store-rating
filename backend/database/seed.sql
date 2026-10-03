USE store_rating_db;

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE ratings;
TRUNCATE TABLE stores;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Seed Users
-- Passwords below correspond to hashed versions of:
-- admin@roxiler.com -> AdminPass@123
-- owner@roxiler.com -> OwnerPass@123
-- user1@roxiler.com -> UserPass@1234
-- user2@roxiler.com -> UserPass@5678

INSERT INTO users (id, name, email, password, address, role) VALUES
(1, 'System Administrator Account', 'admin@roxiler.com', '$2a$10$e8w.p4e5Kx21z7K704QhUO7.7R2Ew4Wb1J8u1B9c7.k7l8m9n0o1p', '123 Admin Street, Tech Headquarters, CA 90001', 'SYSTEM_ADMIN'),
(2, 'Store Owner Manager User', 'owner@roxiler.com', '$2a$10$e8w.p4e5Kx21z7K704QhUO7.7R2Ew4Wb1J8u1B9c7.k7l8m9n0o1p', '456 Commerce Avenue, Business District, NY 10001', 'STORE_OWNER'),
(3, 'Johnathan Doe Sample User', 'user1@roxiler.com', '$2a$10$e8w.p4e5Kx21z7K704QhUO7.7R2Ew4Wb1J8u1B9c7.k7l8m9n0o1p', '789 Residential Way, Apartment 4B, TX 75001', 'NORMAL_USER'),
(4, 'Alice Smith Reviewer One', 'user2@roxiler.com', '$2a$10$e8w.p4e5Kx21z7K704QhUO7.7R2Ew4Wb1J8u1B9c7.k7l8m9n0o1p', '321 Boulevard Park, Suite 100, FL 33101', 'NORMAL_USER');

-- Seed Stores
INSERT INTO stores (id, name, email, address, owner_id) VALUES
(1, 'Roxiler Electronics Store Super', 'store1@roxiler.com', '101 Innovation Drive, Silicon Valley, CA 94025', 2),
(2, 'Roxiler Daily Fresh Grocery Market', 'store2@roxiler.com', '202 Market Square, Downtown, NY 10002', NULL);

-- Seed Ratings
INSERT INTO ratings (id, user_id, store_id, rating) VALUES
(1, 3, 1, 5),
(2, 4, 1, 4),
(3, 3, 2, 3);
