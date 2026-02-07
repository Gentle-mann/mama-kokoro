-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_users_email ON users(email);

-- Grant permissions
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Grant permissions
GRANT SELECT ON conversations TO anon;
GRANT ALL PRIVILEGES ON conversations TO authenticated;

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    response_steps TEXT,
    cultural_context TEXT,
    visual_url VARCHAR(500),
    audio_url VARCHAR(500),
    japanese_terms JSONB DEFAULT '[]',
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_category ON messages(category);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Grant permissions
GRANT SELECT ON messages TO anon;
GRANT ALL PRIVILEGES ON messages TO authenticated;

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    description TEXT
);

-- Create index
CREATE INDEX idx_categories_name ON categories(name);

-- Grant permissions
GRANT SELECT ON categories TO anon;
GRANT ALL PRIVILEGES ON categories TO authenticated;

-- Insert initial data
INSERT INTO categories (name, display_name, icon, description) VALUES
('living', '🏠 Living', 'home', 'Housing, address registration, utilities, and daily life essentials'),
('phone-internet', '📱 Phone & Internet', 'smartphone', 'Mobile plans, SIM cards, internet setup, and digital services'),
('banking', '💰 Banking', 'credit-card', 'Bank accounts, credit cards, money transfers, and financial services'),
('university', '🏫 University Life', 'graduation-cap', 'Student life, campus resources, academic procedures, and study tips'),
('culture', '🎌 Culture', 'torii-gate', 'Japanese customs, etiquette, festivals, and cultural understanding');

-- Create tips table
CREATE TABLE tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    visual_url VARCHAR(500),
    category VARCHAR(50) NOT NULL,
    rating_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tips_user_id ON tips(user_id);
CREATE INDEX idx_tips_category ON tips(category);
CREATE INDEX idx_tips_average_rating ON tips(average_rating DESC);
CREATE INDEX idx_tips_created_at ON tips(created_at DESC);

-- Grant permissions
GRANT SELECT ON tips TO anon;
GRANT ALL PRIVILEGES ON tips TO authenticated;

-- Create tip_ratings table
CREATE TABLE tip_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tip_id UUID REFERENCES tips(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tip_id, user_id)
);

-- Create indexes
CREATE INDEX idx_tip_ratings_tip_id ON tip_ratings(tip_id);
CREATE INDEX idx_tip_ratings_user_id ON tip_ratings(user_id);

-- Grant permissions
GRANT SELECT ON tip_ratings TO anon;
GRANT ALL PRIVILEGES ON tip_ratings TO authenticated;