/*
  # Billing System Database Schema

  ## New Tables
  
  1. `bills`
    - `id` (uuid, primary key)
    - `bill_number` (text, unique)
    - `bill_type` (text) - 'exchange', 'retail', 'service', 'wholesale'
    - `date` (date)
    - `time` (time)
    - `customer_name` (text, nullable)
    - `total_amount` (decimal)
    - `created_by` (uuid, references auth.users)
    - `created_at` (timestamptz)
    
  2. `bill_items`
    - `id` (uuid, primary key)
    - `bill_id` (uuid, references bills)
    - `item_name` (text)
    - `quantity` (decimal)
    - `rate` (decimal)
    - `amount` (decimal)
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their bills
*/

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number text UNIQUE NOT NULL,
  bill_type text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  time time DEFAULT CURRENT_TIME,
  customer_name text,
  total_amount decimal(10, 2) DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid REFERENCES bills(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity decimal(10, 2) DEFAULT 1,
  rate decimal(10, 2) DEFAULT 0,
  amount decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all bills"
  ON bills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bills"
  ON bills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update their bills"
  ON bills FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can delete their bills"
  ON bills FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Authenticated users can view all bill items"
  ON bill_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bill items"
  ON bill_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.created_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can update bill items"
  ON bill_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.created_by = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can delete bill items"
  ON bill_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id
      AND bills.created_by = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_bills_created_by ON bills(created_by);
CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(date DESC);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items(bill_id);