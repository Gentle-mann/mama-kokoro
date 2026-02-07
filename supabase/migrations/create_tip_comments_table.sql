-- Create tip_comments table for storing comments on tips
CREATE TABLE IF NOT EXISTS tip_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tip_comments_tip_id ON tip_comments(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_comments_user_id ON tip_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tip_comments_created_at ON tip_comments(created_at);

-- Add RLS (Row Level Security) policies if needed
-- ALTER TABLE tip_comments ENABLE ROW LEVEL SECURITY;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tip_comments_updated_at 
    BEFORE UPDATE ON tip_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();