# 周深官方网站

这是周深粉丝网站的第三版，使用现代化的前端技术和 Supabase 作为后端服务。

## 功能特点

- 响应式设计，支持桌面端和移动端浏览
- 音乐作品展示和在线播放
- 视频作品展示和在线播放
- 管理员后台，支持内容管理
- 用户认证系统，区分普通用户和管理员

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6+)
- 后端服务：Supabase (数据库、认证、存储)
- 部署：Vercel

## 目录结构

```
.
├── index.html          # 主页面
├── css/                # 样式文件
│   ├── style.css       # 主样式文件
│   ├── components.css  # 组件样式
│   └── auth.css        # 认证模态框样式
├── js/                 # JavaScript 文件
│   ├── config.js       # Supabase 配置
│   ├── utils.js        # 工具函数
│   ├── auth.js         # 认证相关功能
│   ├── music.js        # 音乐播放功能
│   ├── videos.js       # 视频播放功能
│   ├── admin.js        # 管理员功能
│   ├── validate.js     # 配置验证功能
│   └── app.js          # 主应用逻辑
├── SUPABASE_SETUP.md   # Supabase 设置指南
└── README.md           # 项目说明文档
```

## 数据库设置

项目使用 Supabase 作为后端服务，需要创建以下数据表：

### profiles 表

存储用户信息和权限：

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE
);
```

### music 表

存储音乐作品信息：

```sql
CREATE TABLE music (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  audio_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### videos 表

存储视频作品信息：

```sql
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

### 启用行级安全策略（RLS）

为所有表启用RLS并设置策略：

```sql
-- 为表启用RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- profiles表策略
CREATE POLICY "允许用户查看自己的信息" ON profiles
  FOR SELECT USING (id = auth.uid());

-- music表策略
CREATE POLICY "允许所有人查看音乐" ON music
  FOR SELECT USING (true);

CREATE POLICY "仅允许管理员插入音乐" ON music
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "仅允许管理员更新音乐" ON music
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "仅允许管理员删除音乐" ON music
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- videos表策略
CREATE POLICY "允许所有人查看视频" ON videos
  FOR SELECT USING (true);

CREATE POLICY "仅允许管理员插入视频" ON videos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "仅允许管理员更新视频" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "仅允许管理员删除视频" ON videos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### 存储桶设置

项目使用 Supabase Storage 存储媒体文件，需要创建以下存储桶：

1. `music` 存储桶 - 用于存储音频文件
2. `videos` 存储桶 - 用于存储视频文件
3. `images` 存储桶 - 用于存储封面图片和缩略图

创建存储桶后，请确保将它们设置为公开访问，以便用户可以查看媒体内容。

在 Supabase Dashboard 中：
1. 进入 Storage 页面
2. 点击 "Create bucket" 按钮
3. 分别创建名为 `music`、`videos` 和 `images` 的存储桶
4. 为每个存储桶设置适当的访问策略（通常设置为公开读取）

### 自动创建用户档案

创建函数和触发器，当新用户注册时自动创建对应的 profiles 记录：

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

### 设置管理员用户

将特定用户设置为管理员：

```sql
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'your_admin_email@example.com';
```

## 验证配置

项目包含配置验证功能，可以通过以下方式检查Supabase配置是否正确：

1. 在浏览器控制台中运行 `App.runValidation()` 进行完整验证
2. 查看浏览器控制台输出确认连接状态和表结构

## 注意事项

1. 请确保在 Supabase 项目中正确配置了数据库表和RLS策略
2. 确保存储桶已创建并正确配置访问权限
3. 确保 Supabase URL 和匿名密钥在 `config.js` 中正确设置
4. 管理员功能需要先设置管理员用户才能使用
5. 项目使用了 Supabase CDN，在网络不稳定的环境中可能加载较慢