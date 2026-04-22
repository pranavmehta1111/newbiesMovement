-- Supabase SQL Schema for The Newbies Wellness Challenge
-- WARNING: This script drops existing tables to reset the app completely.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop old tables if they exist
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS "daily_logs" CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  challenge_level TEXT NOT NULL CHECK (challenge_level IN ('seedling', 'sprout', 'grower', 'beast', 'legend')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Logs table (replaces activities)
CREATE TABLE daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  sugar_rule_met BOOLEAN DEFAULT false,
  water_liters DECIMAL(3,1) DEFAULT 0.0 CHECK (water_liters >= 0 AND water_liters <= 10.0),
  steps INTEGER DEFAULT 0 CHECK (steps >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_challenge_level ON users(challenge_level);
CREATE INDEX idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read/write for this simple app (no auth for now, phone based)
CREATE POLICY "Allow public read users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON users FOR DELETE USING (true);

-- Daily Logs policies
CREATE POLICY "Allow public read logs" ON daily_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert logs" ON daily_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update logs" ON daily_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete logs" ON daily_logs FOR DELETE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_logs;
