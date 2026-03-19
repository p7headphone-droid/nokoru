-- postsテーブルにthemeカラムを追加
-- Supabase Dashboard > SQL Editor で実行してください

ALTER TABLE posts ADD COLUMN IF NOT EXISTS theme text;
