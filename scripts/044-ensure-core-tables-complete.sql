-- Ensure all core tables exist with proper structure

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES profiles(id) NOT NULL,
    operator_id uuid REFERENCES profiles(id) NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'ended', 'paused')),
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    total_duration integer DEFAULT 0,
    total_cost decimal(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid REFERENCES chat_sessions(id) NOT NULL,
    sender_id uuid REFERENCES profiles(id) NOT NULL,
    message text NOT NULL,
    message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at timestamp with time zone DEFAULT now()
);

-- Call sessions table
CREATE TABLE IF NOT EXISTS call_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES profiles(id) NOT NULL,
    operator_id uuid REFERENCES profiles(id) NOT NULL,
    twilio_call_sid text,
    status text DEFAULT 'initiated' CHECK (status IN ('initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer')),
    start_time timestamp with time zone DEFAULT now(),
    end_time timestamp with time zone,
    duration integer DEFAULT 0,
    cost decimal(10,2) DEFAULT 0,
    recording_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Written consultations table
CREATE TABLE IF NOT EXISTS written_consultations (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES profiles(id) NOT NULL,
    operator_id uuid REFERENCES profiles(id) NOT NULL,
    question text NOT NULL,
    answer text,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'cancelled')),
    cost decimal(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    answered_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    amount decimal(10,2) NOT NULL,
    transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund')),
    description text,
    reference_id uuid,
    reference_type text,
    created_at timestamp with time zone DEFAULT now()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id uuid REFERENCES profiles(id) NOT NULL,
    operator_id uuid REFERENCES profiles(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(client_id, operator_id)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES profiles(id) NOT NULL,
    subject text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to uuid REFERENCES profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE written_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_client_id ON chat_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_operator_id ON chat_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_client_id ON call_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_call_sessions_operator_id ON call_sessions(operator_id);
CREATE INDEX IF NOT EXISTS idx_written_consultations_client_id ON written_consultations(client_id);
CREATE INDEX IF NOT EXISTS idx_written_consultations_operator_id ON written_consultations(operator_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_client_id ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
