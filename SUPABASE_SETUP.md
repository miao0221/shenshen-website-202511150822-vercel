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

## 5. 存储桶设置

项目使用 Supabase Storage 存储媒体文件，需要创建以下存储桶：

1. `music` 存储桶 - 用于存储音频文件
2. `videos` 存储桶 - 用于存储视频文件
3. `images` 存储桶 - 用于存储封面图片和缩略图

### 创建存储桶

在 Supabase Dashboard 中：
1. 进入 Storage 页面
2. 点击 "Create bucket" 按钮
3. 分别创建名为 `music`、`videos` 和 `images` 的存储桶

### 存储桶RLS策略设置

为了确保安全性和正确的访问控制，需要为每个存储桶设置RLS策略：

```sql
-- 注意：这些命令需要在Supabase SQL编辑器中执行

-- 为存储对象表启用RLS（如果尚未启用）
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 为music存储桶设置策略
-- 允许认证用户上传文件
CREATE POLICY "允许认证用户上传音频文件" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'music');

-- 允许所有人读取音频文件
CREATE POLICY "允许所有人读取音频文件" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'music');

-- 仅允许管理员更新音频文件
CREATE POLICY "仅允许管理员更新音频文件" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'music' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 仅允许管理员删除音频文件
CREATE POLICY "仅允许管理员删除音频文件" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'music' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 为videos存储桶设置策略
-- 允许认证用户上传文件
CREATE POLICY "允许认证用户上传视频文件" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'videos');

-- 允许所有人读取视频文件
CREATE POLICY "允许所有人读取视频文件" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'videos');

-- 仅允许管理员更新视频文件
CREATE POLICY "仅允许管理员更新视频文件" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 仅允许管理员删除视频文件
CREATE POLICY "仅允许管理员删除视频文件" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'videos' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 为images存储桶设置策略
-- 允许认证用户上传文件
CREATE POLICY "允许认证用户上传图片文件" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'images');

-- 允许所有人读取图片文件
CREATE POLICY "允许所有人读取图片文件" ON storage.objects 
FOR SELECT TO public 
USING (bucket_id = 'images');

-- 仅允许管理员更新图片文件
CREATE POLICY "仅允许管理员更新图片文件" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- 仅允许管理员删除图片文件
CREATE POLICY "仅允许管理员删除图片文件" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);
```

## 6. 示例数据

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

## 7. 设置管理员用户

将特定用户设置为管理员：

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = '1046781739@qq.com';
```

请将 `1046781739@qq.com` 替换为您要设置为管理员的实际用户邮箱。