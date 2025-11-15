# 周深官方网站

这是一个为歌手周深创建的官方网站，包含音乐和视频作品展示、用户认证和管理员功能。

## 功能特性

- 音乐作品展示和播放
- 视频作品展示和播放
- 用户注册和登录
- 管理员后台（音乐和视频管理）
- 响应式设计，适配各种设备

## 技术栈

- 前端：HTML5, CSS3, JavaScript (ES6)
- 后端：Supabase (BaaS)
- 部署：Vercel

## 项目结构

```
.
├── index.html          # 主页面
├── css/
│   ├── style.css       # 全局样式
│   ├── components.css  # 组件样式
│   └── auth.css        # 认证样式
├── js/
│   ├── config.js       # Supabase配置
│   ├── utils.js        # 工具函数
│   ├── auth.js         # 认证功能
│   ├── music.js        # 音乐功能
│   ├── videos.js       # 视频功能
│   ├── admin.js        # 管理员功能
│   ├── validate.js     # 配置验证
│   └── app.js          # 主应用逻辑
└── assets/             # 静态资源（图片等）
```

## 运行项目

### 方法1：使用 VS Code Live Server 扩展

1. 安装 VS Code Live Server 扩展
2. 右键点击 `index.html` 文件
3. 选择 "Open with Live Server"

### 方法2：使用 Python 简易服务器

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

然后在浏览器中访问 `http://localhost:8000`

### 方法3：使用 Node.js http-server

```bash
# 安装 http-server
npm install -g http-server

# 运行服务器
http-server
```

然后在浏览器中访问 `http://localhost:8080`

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
2. 确保 Supabase URL 和匿名密钥在 `config.js` 中正确设置
3. 管理员功能需要先设置管理员用户才能使用
4. 项目使用了 Supabase CDN，在网络不稳定的环境中可能加载较慢