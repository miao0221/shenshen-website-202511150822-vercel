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
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员更新音乐
CREATE POLICY "仅允许管理员更新音乐" ON music
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员删除音乐
CREATE POLICY "仅允许管理员删除音乐" ON music
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
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
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员更新视频
CREATE POLICY "仅允许管理员更新视频" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 仅允许管理员删除视频
CREATE POLICY "仅允许管理员删除视频" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

## 3. 创建 `profiles` 表

在 Supabase SQL 编辑器中运行以下 SQL 语句：

```sql
-- 创建 profiles 表
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE
);

-- 为 profiles 表启用行级安全策略（RLS）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 为 profiles 表创建策略
-- 允许用户查看自己的信息
CREATE POLICY "允许用户查看自己的信息" ON profiles
  FOR SELECT USING (id = auth.uid());
```

## 4. 创建自动创建 profiles 记录的函数和触发器

```sql
-- 创建函数：当新用户注册时自动创建profiles记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_admin)
  VALUES (NEW.id, NEW.email, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. 示例数据

以下是一些示例数据，您可以根据需要修改：

### 音乐示例数据

```sql
INSERT INTO music (title, description, audio_url, cover_url, created_by) VALUES
('大鱼', '动画电影《大鱼海棠》印象曲', 'https://example.com/dayu.mp3', 'https://example.com/dayu.jpg', '00000000-0000-0000-0000-000000000000'),
('光亮', '纪录片《紫禁城》主题曲', 'https://example.com/guangliang.mp3', 'https://example.com/guangliang.jpg', '00000000-0000-0000-0000-000000000000');
```

### 视频示例数据

```sql
INSERT INTO videos (title, description, video_url, thumbnail_url, created_by) VALUES
('周深现场演唱《大鱼》', '周深在音乐节现场演唱《大鱼》', 'https://example.com/dayu_concert.mp4', 'https://example.com/dayu_concert_thumb.jpg', '00000000-0000-0000-0000-000000000000'),
('周深访谈节目', '周深参加某访谈节目的精彩片段', 'https://example.com/interview.mp4', 'https://example.com/interview_thumb.jpg', '00000000-0000-0000-0000-000000000000');
```

## 6. 设置管理员用户

将特定用户设置为管理员：

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = '1046781739@qq.com';
```

请将 `1046781739@qq.com` 替换为您要设置为管理员的实际用户邮箱。