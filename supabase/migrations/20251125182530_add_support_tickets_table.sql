/*
  # Add Support Tickets System

  ## Overview
  Creates a support ticket system for users to contact support and track their requests.

  ## New Tables
  
  ### `support_tickets`
  - `id` (uuid, primary key) - Unique ticket identifier
  - `user_id` (uuid, foreign key to auth.users) - User who created the ticket
  - `subject` (text) - Ticket subject/title
  - `message` (text) - Detailed message from user
  - `category` (text) - Type of support request
  - `status` (text) - Current status: 'open', 'in_progress', 'resolved', 'closed'
  - `priority` (text) - Priority level: 'low', 'medium', 'high', 'urgent'
  - `assigned_to` (uuid) - Support staff assigned (nullable)
  - `resolved_at` (timestamptz) - When ticket was resolved
  - `created_at` (timestamptz) - When ticket was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `support_ticket_replies`
  - `id` (uuid, primary key) - Unique reply identifier
  - `ticket_id` (uuid, foreign key to support_tickets) - Parent ticket
  - `user_id` (uuid, foreign key to auth.users) - User who replied
  - `message` (text) - Reply message content
  - `is_staff_reply` (boolean) - Whether reply is from support staff
  - `created_at` (timestamptz) - When reply was created

  ## Security
  - Enable RLS on all tables
  - Users can view and update their own tickets
  - Users can create replies to their own tickets
  - Only support staff can view all tickets (to be implemented with admin roles)

  ## Indexes
  - Index on user_id for fast ticket lookups
  - Index on status for filtering
  - Index on ticket_id for reply lookups
*/

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'technical', 'billing', 'feature', 'bug', 'account')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create support_ticket_replies table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_staff_reply boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_user_id ON support_ticket_replies(user_id);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for support_ticket_replies
CREATE POLICY "Users can view replies to own tickets"
  ON support_ticket_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_replies.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create replies to own tickets"
  ON support_ticket_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

-- Function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_ticket_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on ticket updates
DROP TRIGGER IF EXISTS support_tickets_updated_at ON support_tickets;
CREATE TRIGGER support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_support_ticket_timestamp();
