-- Migration 003: プライバシーバグ修正
-- 非公開投稿が他ユーザーに見えていた問題を修正

-- ── posts RLS ────────────────────────────────────────────────────────────────
-- 既存ポリシーを削除して再作成（明示的な visibility チェック）
drop policy if exists "visibility別閲覧制御" on public.posts;

create policy "visibility別閲覧制御" on public.posts for select using (
  -- 全体公開: 誰でも閲覧可
  (posts.visibility = 'public')
  -- 本人: 自分の投稿はすべて閲覧可（非公開含む）
  or (auth.uid() = posts.user_id)
  -- 友達限定: 相互フォローのユーザーのみ
  or (
    posts.visibility = 'friends'
    and auth.uid() is not null
    and exists (
      select 1 from public.follows f1
      join public.follows f2
        on f1.follower_id = f2.following_id
        and f1.following_id = f2.follower_id
      where f1.follower_id = auth.uid()
        and f1.following_id = posts.user_id
    )
  )
  -- 注意: visibility = 'private' は auth.uid() = posts.user_id のみにマッチ
  --       つまり他ユーザー・未ログインユーザーには絶対に返らない
);

-- ── post_tags RLS ─────────────────────────────────────────────────────────────
-- 非公開投稿のタグが漏れないよう、投稿の閲覧権限に連動させる
drop policy if exists "誰でも閲覧可" on public.post_tags;

create policy "投稿閲覧権限に連動" on public.post_tags for select using (
  exists (
    select 1 from public.posts p
    where p.id = post_tags.post_id
      and (
        p.visibility = 'public'
        or auth.uid() = p.user_id
        or (
          p.visibility = 'friends'
          and auth.uid() is not null
          and exists (
            select 1 from public.follows f1
            join public.follows f2
              on f1.follower_id = f2.following_id
              and f1.following_id = f2.follower_id
            where f1.follower_id = auth.uid()
              and f1.following_id = p.user_id
          )
        )
      )
  )
);

-- ── reactions RLS ─────────────────────────────────────────────────────────────
-- 非公開投稿へのリアクションが漏れないよう、投稿の閲覧権限に連動させる
drop policy if exists "誰でも閲覧可" on public.reactions;

create policy "投稿閲覧権限に連動" on public.reactions for select using (
  exists (
    select 1 from public.posts p
    where p.id = reactions.post_id
      and (
        p.visibility = 'public'
        or auth.uid() = p.user_id
        or (
          p.visibility = 'friends'
          and auth.uid() is not null
          and exists (
            select 1 from public.follows f1
            join public.follows f2
              on f1.follower_id = f2.following_id
              and f1.following_id = f2.follower_id
            where f1.follower_id = auth.uid()
              and f1.following_id = p.user_id
          )
        )
      )
  )
);
