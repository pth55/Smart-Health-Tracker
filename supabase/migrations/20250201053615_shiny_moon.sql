/*
  # Fix Profile RLS Policies

  1. Changes
    - Add policy to allow profile creation during signup
    - Modify existing policies to be more permissive for authenticated users
    - Ensure proper access control while maintaining security

  2. Security
    - Users can create their own profile
    - Users can only view and update their own profile
    - Maintains data isolation between users
*/

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policies with proper permissions
CREATE POLICY "Enable insert for authenticated users only"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);