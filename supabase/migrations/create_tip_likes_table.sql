-- Create tip_likes table for separate like functionality
CREATE TABLE IF NOT EXISTS tip_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip_id UUID NOT NULL REFERENCES tips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tip_id, user_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tip_likes_tip_id ON tip_likes(tip_id);
CREATE INDEX IF NOT EXISTS idx_tip_likes_user_id ON tip_likes(user_id);

-- Add RLS policies
ALTER TABLE tip_likes ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see all likes
CREATE POLICY "Users can view all likes" ON tip_likes
  FOR SELECT USING (true);

-- Policy to allow users to like tips
CREATE POLICY "Users can like tips" ON tip_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to unlike their own likes
CREATE POLICY "Users can unlike their own likes" ON tip_likes
  FOR DELETE USING (auth.uid() = user_id);