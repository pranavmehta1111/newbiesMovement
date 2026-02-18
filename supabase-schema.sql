-- Supabase SQL Schema for The Newbies Movement Challenge
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('underdog', 'normie', 'rockstar', 'superhuman')),
  champion TEXT NOT NULL CHECK (champion IN ('puppy', 'kitten', 'bird')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL CHECK (distance_km > 0 AND distance_km <= 100),
  logged_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_category ON users(category);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_logged_at ON activities(logged_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read/write for this simple app (no auth)
-- In production, you'd want more restrictive policies

-- Users policies
CREATE POLICY "Allow public read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update users" ON users
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete users" ON users
  FOR DELETE USING (true);

-- Activities policies
CREATE POLICY "Allow public read activities" ON activities
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert activities" ON activities
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete activities" ON activities
  FOR DELETE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
