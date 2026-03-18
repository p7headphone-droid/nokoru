-- Migration 002: posts テーブルに mood カラムを追加
-- Supabase ダッシュボード > SQL Editor で実行してください

alter table public.posts
  add column if not exists mood text check (mood in ('happy', 'sad', 'positive'));
