-- Migration 001: 投稿モード・公開設定・フォロー機能の追加
-- Supabase ダッシュボード > SQL Editor で実行してください

-- 1. posts テーブルにカラムを追加
alter table public.posts
  add column if not exists mode text check (mode in ('note', 'diary')) default 'note' not null,
  add column if not exists visibility text check (visibility in ('public', 'friends', 'private')) default 'public' not null;

-- 2. follows テーブルを作成（相互フォローで「友達」を定義）
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id)
);

alter table public.follows enable row level security;

-- 3. posts の SELECT RLS ポリシーを更新
--    （古い「誰でも閲覧可」を削除し、visibility 別制御に変更）
drop policy if exists "誰でも閲覧可" on public.posts;

create policy "visibility別閲覧制御" on public.posts for select using (
  visibility = 'public'
  or auth.uid() = user_id
  or (
    visibility = 'friends'
    and auth.uid() is not null
    and exists (
      select 1 from public.follows f1
      join public.follows f2
        on f1.follower_id = f2.following_id
        and f1.following_id = f2.follower_id
      where f1.follower_id = auth.uid()
        and f1.following_id = user_id
    )
  )
);

-- 4. follows の RLS ポリシーを追加
drop policy if exists "誰でも閲覧可" on public.follows;
drop policy if exists "認証ユーザーがフォロー可" on public.follows;
drop policy if exists "本人のみ削除可" on public.follows;

create policy "誰でも閲覧可" on public.follows for select using (true);
create policy "認証ユーザーがフォロー可" on public.follows for insert with check (auth.uid() = follower_id);
create policy "本人のみ削除可" on public.follows for delete using (auth.uid() = follower_id);
