-- Profiles (auth.usersと1:1)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now() not null
);

-- Tags
create table public.tags (
  id uuid default gen_random_uuid() primary key,
  name text unique not null
);

-- Posts
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Post-Tag中間テーブル
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- Reactions
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text check (reaction_type in ('wakaru', 'omoshiroi', 'ki_ni_naru')) not null,
  created_at timestamptz default now() not null,
  unique (post_id, user_id, reaction_type)
);

-- RLS有効化
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.reactions enable row level security;

-- Profiles RLS
create policy "誰でも閲覧可" on public.profiles for select using (true);
create policy "本人のみ更新可" on public.profiles for update using (auth.uid() = id);

-- Posts RLS
create policy "誰でも閲覧可" on public.posts for select using (true);
create policy "認証ユーザーが作成可" on public.posts for insert with check (auth.uid() = user_id);
create policy "本人のみ更新可" on public.posts for update using (auth.uid() = user_id);
create policy "本人のみ削除可" on public.posts for delete using (auth.uid() = user_id);

-- Tags RLS
create policy "誰でも閲覧可" on public.tags for select using (true);
create policy "認証ユーザーが作成可" on public.tags for insert with check (auth.role() = 'authenticated');

-- Post_tags RLS
create policy "誰でも閲覧可" on public.post_tags for select using (true);
create policy "投稿者が管理可" on public.post_tags for insert with check (
  auth.uid() = (select user_id from public.posts where id = post_id)
);
create policy "投稿者が削除可" on public.post_tags for delete using (
  auth.uid() = (select user_id from public.posts where id = post_id)
);

-- Reactions RLS
create policy "誰でも閲覧可" on public.reactions for select using (true);
create policy "認証ユーザーが作成可" on public.reactions for insert with check (auth.uid() = user_id);
create policy "本人のみ削除可" on public.reactions for delete using (auth.uid() = user_id);

-- ユーザー作成時にprofileを自動生成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_atを自動更新するトリガー
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.update_updated_at();
