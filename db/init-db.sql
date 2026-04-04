-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    role VARCHAR(50) DEFAULT 'buyer', -- buyer, seller, admin
    status VARCHAR(50) DEFAULT 'active', -- active, blocked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. restaurants Table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    location GEOGRAPHY(Point, 4326), -- PostGIS geography for proximity search
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. dishes Table
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    quantity INTEGER DEFAULT 0,
    original_price DECIMAL(10, 2),
    discount_price DECIMAL(10, 2),
    pickup_start TIME,
    pickup_end TIME,
    status VARCHAR(50) DEFAULT 'active', -- active, sold_out, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    buyer_id INTEGER REFERENCES users(id),
    dish_id INTEGER REFERENCES dishes(id),
    quantity INTEGER DEFAULT 1,
    verification_code VARCHAR(10) UNIQUE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. favorites Table
CREATE TABLE favorites (
    user_id INTEGER REFERENCES users(id),
    restaurant_id INTEGER REFERENCES restaurants(id),
    PRIMARY KEY (user_id, restaurant_id)
);

-- Index for spatial search
CREATE INDEX idx_restaurants_location ON restaurants USING GIST (location);
