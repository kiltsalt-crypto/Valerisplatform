/*
  # Add Support Responses Table

  1. New Tables
    - `support_responses`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to support_tickets)
      - `user_id` (uuid, foreign key to auth.users)
      - `message` (text)
      - `is_admin_response` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `support_responses` table
    - Add policy for users to view responses on their tickets
    - Add policy for admins to view all responses
    - Add policy for admins to create responses
    - Add policy for users to create responses on their own tickets
*/

CREATE TABLE IF NOT EXISTS support_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_admin_response boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view responses on their tickets"
  ON support_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all responses"
  ON support_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can create responses"
  ON support_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can respond to their own tickets"
  ON support_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );
