# Supabase 数据库设置指南

本指南将帮助您在 Supabase 中创建所需的 music 和 videos 表，并设置正确的行级安全策略（RLS）。

## 1. 创建 `music` 表

在 Supabase SQL 编辑器中运行以下 SQL 语句：

```sql
-- 创建 music 表
CREATE TABLE music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 为 music 表启用行级安全策略（RLS）
ALTER TABLE music ENABLE ROW LEVEL SECURITY;

-- 为 music 表创建策略
-- 允许所有人查看音乐
CREATE POLICY "允许所有人查看音乐" ON music
  FOR SELECT USING (true);

-- 仅允许管理员插入音乐
CREATE POLICY "仅允许管理员插入音乐" ON music
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员更新音乐
CREATE POLICY "仅允许管理员更新音乐" ON music
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员删除音乐
CREATE POLICY "仅允许管理员删除音乐" ON music
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

## 2. 创建 `videos` 表

在 Supabase SQL 编辑器中运行以下 SQL 语句：

```sql
-- 创建 videos 表
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 为 videos 表启用行级安全策略（RLS）
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 为 videos 表创建策略
-- 允许所有人查看视频
CREATE POLICY "允许所有人查看视频" ON videos
  FOR SELECT USING (true);

-- 仅允许管理员插入视频
CREATE POLICY "仅允许管理员插入视频" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员更新视频
CREATE POLICY "仅允许管理员更新视频" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员删除视频
CREATE POLICY "仅允许管理员删除视频" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );
```

## 3. 插入示例数据

创建表后，您可以插入一些示例数据来测试网站功能：

```sql
-- 插入音乐示例数据
INSERT INTO music (title, description, audio_url, cover_url, created_by) VALUES
  ('大鱼', '动画电影《大鱼海棠》印象曲', 'https://example.com/music/dayu.mp3', 'https://example.com/images/dayu.jpg', NULL),
  ('光亮', '纪录片《紫禁城》主题曲', 'https://example.com/music/guangliang.mp3', 'https://example.com/images/guangliang.jpg', NULL),
  ('起风了', '热门翻唱作品', 'https://example.com/music/qifengle.mp3', 'https://example.com/images/qifengle.jpg', NULL);

-- 插入视频示例数据
INSERT INTO videos (title, description, video_url, thumbnail_url, created_by) VALUES
  ('周深现场演唱《大鱼》', '周深在某音乐节目现场演唱《大鱼》', 'https://example.com/videos/dayu.mp4', 'https://example.com/images/dayu_video.jpg', NULL),
  ('周深采访片段', '周深接受媒体采访的精彩片段', 'https://example.com/videos/interview.mp4', 'https://example.com/images/interview.jpg', NULL),
  ('周深MV合集', '周深历年来的音乐视频合集', 'https://example.com/videos/mv_collection.mp4', 'https://example.com/images/mv_collection.jpg', NULL);
```

## 4. 验证设置

创建表和策略后，您可以执行以下操作来验证设置是否正确：

1. 以普通用户身份查询数据，应能成功获取音乐和视频列表
2. 以普通用户身份尝试插入数据，应被拒绝
3. 以管理员身份尝试插入数据，应能成功

## 5. 注意事项

1. 确保您已经创建了 `profiles` 表并设置了相应的管理员权限
2. 确保您的 Supabase 项目已正确配置，并且前端代码中的 SUPABASE_URL 和 SUPABASE_ANON_KEY 是正确的
3. 示例数据中的 URL 需要替换为实际可用的资源链接