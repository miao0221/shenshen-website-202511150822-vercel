// 使用IIFE包装避免全局变量污染
(function() {
    // 检查数据表是否存在
    async function checkTableExists(tableName) {
        try {
            const { data, error } = await window.App.supabase
                .from(tableName)
                .select('*')
                .limit(1);
            
            // 如果没有错误，说明表存在
            if (!error) {
                return { exists: true, error: null };
            }
            
            // 检查错误类型
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                return { exists: false, error: '表不存在' };
            }
            
            // 其他错误
            return { exists: true, error: error.message };
        } catch (error) {
            console.error(`检查表 ${tableName} 时发生错误:`, error.message);
            return { exists: false, error: error.message };
        }
    }

    // 存储桶存在性缓存
    const bucketCache = new Map();
    // 缓存过期时间（5分钟）
    const CACHE_EXPIRY = 5 * 60 * 1000;
    
    // 检查存储桶是否存在
    async function checkBucketExists(bucketName) {
        try {
            // 检查缓存（带过期时间）
            if (bucketCache.has(bucketName)) {
                const cached = bucketCache.get(bucketName);
                if (Date.now() - cached.timestamp < CACHE_EXPIRY) {
                    console.log(`从缓存中获取存储桶状态: ${bucketName}`, cached.exists);
                    if (cached.exists) {
                        return true;
                    }
                    // 即使缓存中不存在，也继续执行实际检查以确认
                } else {
                    // 缓存过期，清除
                    bucketCache.delete(bucketName);
                }
            }
            
            console.log(`正在检查存储桶是否存在: ${bucketName}`);
            
            // 获取存储桶列表
            const { data: buckets, error: listError } = await window.App.supabase.storage.listBuckets();
            
            if (listError) {
                console.error('获取存储桶列表失败:', listError.message);
                // 特别处理网络连接问题
                if (listError.message.includes('Failed to fetch') || listError.message.includes('NetworkError')) {
                    const errorMsg = '网络连接失败，请检查网络设置或稍后重试';
                    throw new Error(errorMsg);
                }
                
                const errorMsg = `无法连接到存储服务: ${listError.message}`;
                throw new Error(errorMsg);
            }
            
            if (!buckets || !Array.isArray(buckets)) {
                const errorMsg = '获取的存储桶列表格式无效';
                console.error(errorMsg, buckets);
                throw new Error(errorMsg);
            }
            
            console.log('获取到的存储桶列表:', buckets.map(b => b.name));
            
            // 检查存储桶是否存在
            const bucketExists = buckets.some(bucket => bucket.name === bucketName);
            
            // 缓存结果（带时间戳）
            bucketCache.set(bucketName, {
                exists: bucketExists,
                timestamp: Date.now()
            });
            
            if (!bucketExists) {
                // 提供更详细的错误信息和创建指导
                const bucketNames = buckets.map(b => b.name).join(', ') || '无';
                const errorMsg = `存储桶 "${bucketName}" 不存在，请在 Supabase 后台 Storage 页面创建该存储桶。\n` +
                                `当前可用的存储桶: ${bucketNames}\n\n` +
                                `创建步骤:\n` +
                                `1. 登录 Supabase 控制台\n` +
                                `2. 进入 Storage 页面\n` +
                                `3. 点击 "Create bucket" 按钮\n` +
                                `4. 输入存储桶名称 "${bucketName}" 并创建\n` +
                                `5. 将存储桶设置为 Public 访问权限`;
                console.warn(errorMsg);
                throw new Error(errorMsg);
            }
            
            console.log(`存储桶 ${bucketName} 存在`);
            return true;
        } catch (error) {
            console.error('检查存储桶时发生错误:', error.message);
            // 清除可能的脏缓存
            bucketCache.delete(bucketName);
            
            // 提供更友好的错误信息
            if (error.message.includes('Invalid authentication credentials')) {
                throw new Error('认证失败，请检查 Supabase 配置中的密钥是否正确');
            }
            
            throw error;
        }
    }

    // 渲染音乐管理表格
    function renderMusicManagementTable(musicData) {
        const container = document.getElementById('music-management-table');
        
        if (!container) {
            console.error('找不到音乐管理表格容器');
            return;
        }
        
        if (!musicData || musicData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>音乐库为空</p>
                    <p class="empty-state-subtitle">添加一些音乐作品来开始管理</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="media-table">
                <thead>
                    <tr>
                        <th>封面</th>
                        <th>标题</th>
                        <th>描述</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        musicData.forEach(music => {
            html += `
                <tr>
                    <td>
                        <img src="${music.cover_url || 'https://via.placeholder.com/50'}" alt="${music.title}" class="media-table-cover">
                    </td>
                    <td>${music.title}</td>
                    <td>${music.description || '无描述'}</td>
                    <td>${new Date(music.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-button" data-id="${music.id}" data-type="music">删除</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }

    // 渲染视频管理表格
    function renderVideoManagementTable(videoData) {
        const container = document.getElementById('video-management-table');
        
        if (!container) {
            console.error('找不到视频管理表格容器');
            return;
        }
        
        if (!videoData || videoData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>视频库为空</p>
                    <p class="empty-state-subtitle">添加一些视频作品来开始管理</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <table class="media-table">
                <thead>
                    <tr>
                        <th>缩略图</th>
                        <th>标题</th>
                        <th>描述</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        videoData.forEach(video => {
            html += `
                <tr>
                    <td>
                        <img src="${video.thumbnail_url || 'https://via.placeholder.com/50'}" alt="${video.title}" class="media-table-cover">
                    </td>
                    <td>${video.title}</td>
                    <td>${video.description || '无描述'}</td>
                    <td>${new Date(video.created_at).toLocaleDateString()}</td>
                    <td>
                        <button class="delete-button" data-id="${video.id}" data-type="video">删除</button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }

    // 显示加载指示器
    function showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '<div class="loading-indicator">加载中...</div>';
        }
    }

    // 显示错误信息
    function showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="error-message">错误: ${message}</div>`;
        }
    }

    // 显示通知消息
    function showNotification(elementId, message, isSuccess = true) {
        const notification = document.getElementById(elementId);
        if (!notification) {
            console.error('找不到通知元素:', elementId);
            return;
        }
        
        notification.textContent = message;
        notification.className = `notification ${isSuccess ? 'success' : 'error'}`;
        
        // 3秒后隐藏通知
        setTimeout(() => {
            notification.className = 'notification';
            notification.textContent = '';
        }, 3000);
    }

    // 显示Toast通知
    function showToast(message, isSuccess = true) {
        // 创建Toast容器（如果不存在）
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(toastContainer);
        }
        
        // 创建Toast元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            background-color: ${isSuccess ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 16px 24px;
            margin-bottom: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
            max-width: 400px;
        `;
        
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
        // 3秒后移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 显示文件预览
    function showFilePreview(file, previewElementId) {
        const previewElement = document.getElementById(previewElementId);
        if (!previewElement || !file) return;
        
        // 清空之前的预览内容
        previewElement.innerHTML = '';
        previewElement.style.display = 'block';
        
        // 根据文件类型显示不同预览
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewElement.innerHTML = `
                    <img src="${e.target.result}" alt="预览图片">
                    <div class="file-info">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            // 对于非图片文件，显示文件信息
            previewElement.innerHTML = `
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-type">${file.type || '未知类型'}</div>
                </div>
            `;
        }
    }

    // 加载音乐管理数据
    async function loadMusicManagementData() {
        try {
            showLoading('music-management-table');
            
            const { data, error } = await window.App.supabase
                .from('music')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error('获取音乐数据失败: ' + error.message);
            }
            
            renderMusicManagementTable(data);
        } catch (error) {
            console.error('加载音乐管理数据时发生错误:', error.message);
            showError('music-management-table', error.message);
        }
    }

    // 加载视频管理数据
    async function loadVideoManagementData() {
        try {
            showLoading('video-management-table');
            
            const { data, error } = await window.App.supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw new Error('获取视频数据失败: ' + error.message);
            }
            
            renderVideoManagementTable(data);
        } catch (error) {
            console.error('加载视频管理数据时发生错误:', error.message);
            showError('video-management-table', error.message);
        }
    }

    // 删除音乐
    async function deleteMusic(id) {
        try {
            // 验证管理员权限
            await window.App.auth.verifyAdminAccess();
            
            console.log('正在删除音乐:', id);
            
            // 首先获取音乐记录以获取文件URL
            const { data: music, error: fetchError } = await window.App.supabase
                .from('music')
                .select('audio_url, cover_url')
                .eq('id', id)
                .single();
            
            if (fetchError) {
                throw new Error('获取音乐信息失败: ' + fetchError.message);
            }
            
            // 从数据库中删除记录
            const { error: deleteError } = await window.App.supabase
                .from('music')
                .delete()
                .eq('id', id);
            
            if (deleteError) {
                throw new Error('删除音乐记录失败: ' + deleteError.message);
            }
            
            // 从存储桶中删除音频文件
            if (music.audio_url) {
                const audioPath = new URL(music.audio_url).pathname.substring(1); // 移除开头的斜杠
                const { error: audioDeleteError } = await window.App.supabase
                    .storage
                    .from('music')
                    .remove([audioPath]);
                
                if (audioDeleteError) {
                    console.warn('删除音频文件失败:', audioDeleteError.message);
                }
            }
            
            // 从存储桶中删除封面图片
            if (music.cover_url) {
                const coverPath = new URL(music.cover_url).pathname.substring(1); // 移除开头的斜杠
                const { error: coverDeleteError } = await window.App.supabase
                    .storage
                    .from('images')
                    .remove([coverPath]);
                
                if (coverDeleteError) {
                    console.warn('删除封面图片失败:', coverDeleteError.message);
                }
            }
            
            console.log('音乐删除成功:', id);
            return true;
        } catch (error) {
            console.error('删除音乐时发生错误:', error.message);
            throw error;
        }
    }

    // 删除视频
    async function deleteVideo(id) {
        try {
            // 验证管理员权限
            await window.App.auth.verifyAdminAccess();
            
            console.log('正在删除视频:', id);
            
            // 首先获取视频记录以获取文件URL
            const { data: video, error: fetchError } = await window.App.supabase
                .from('videos')
                .select('video_url, thumbnail_url')
                .eq('id', id)
                .single();
            
            if (fetchError) {
                throw new Error('获取视频信息失败: ' + fetchError.message);
            }
            
            // 从数据库中删除记录
            const { error: deleteError } = await window.App.supabase
                .from('videos')
                .delete()
                .eq('id', id);
            
            if (deleteError) {
                throw new Error('删除视频记录失败: ' + deleteError.message);
            }
            
            // 从存储桶中删除视频文件
            if (video.video_url) {
                const videoPath = new URL(video.video_url).pathname.substring(1); // 移除开头的斜杠
                const { error: videoDeleteError } = await window.App.supabase
                    .storage
                    .from('videos')
                    .remove([videoPath]);
                
                if (videoDeleteError) {
                    console.warn('删除视频文件失败:', videoDeleteError.message);
                }
            }
            
            // 从存储桶中删除缩略图
            if (video.thumbnail_url) {
                const thumbnailPath = new URL(video.thumbnail_url).pathname.substring(1); // 移除开头的斜杠
                const { error: thumbnailDeleteError } = await window.App.supabase
                    .storage
                    .from('images')
                    .remove([thumbnailPath]);
                
                if (thumbnailDeleteError) {
                    console.warn('删除缩略图失败:', thumbnailDeleteError.message);
                }
            }
            
            console.log('视频删除成功:', id);
            return true;
        } catch (error) {
            console.error('删除视频时发生错误:', error.message);
            throw error;
        }
    }

    // 上传文件到Supabase存储桶
    async function uploadFile(file, bucket, onProgress) {
        try {
            console.log('正在上传文件到存储桶:', bucket, file.name);
            
            // 检查存储桶是否存在
            await checkBucketExists(bucket);
            
            const fileName = `${Date.now()}_${file.name}`;
            
            // 准备上传选项
            const uploadOptions = {
                cacheControl: '3600',
                upsert: false
            };
            
            // 如果提供了进度回调，则添加到选项中
            if (onProgress) {
                uploadOptions.onUploadProgress = onProgress;
            }
            
            const { data, error } = await window.App.supabase.storage
                .from(bucket)
                .upload(fileName, file, uploadOptions);
            
            if (error) {
                // 特别处理常见错误
                if (error.message.includes('duplicate key value violates unique constraint')) {
                    throw new Error('文件名冲突，请稍后重试或更改文件名');
                }
                
                if (error.message.includes('permission denied')) {
                    throw new Error('权限不足，无法上传文件到存储桶');
                }
                
                throw new Error('文件上传失败: ' + error.message);
            }
            
            // 获取公共URL
            const { data: { publicUrl }, error: urlError } = window.App.supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);
            
            if (urlError) {
                throw new Error('获取文件URL失败: ' + urlError.message);
            }
            
            console.log('文件上传成功:', publicUrl);
            return publicUrl;
        } catch (error) {
            console.error('上传文件时发生错误:', error.message);
            throw error;
        }
    }

    // 添加新音乐
    async function addMusic(title, description, coverFile, audioFile, onProgress) {
        try {
            // 验证管理员权限
            await window.App.auth.verifyAdminAccess();
            
            console.log('正在添加新音乐:', title);
            
            // 检查是否提供了必需的文件
            if (!audioFile) {
                throw new Error('必须提供音频文件');
            }
            
            // 上传封面图片
            let coverUrl = null;
            if (coverFile) {
                coverUrl = await uploadFile(coverFile, 'images', onProgress);
            }
            
            // 上传音频文件
            let audioUrl = null;
            if (audioFile) {
                audioUrl = await uploadFile(audioFile, 'music', onProgress);
            }
            
            const { data: { user } } = await window.App.supabase.auth.getUser();
            
            // 插入数据库记录
            const { data, error } = await window.App.supabase
                .from('music')
                .insert([
                    {
                        title: title,
                        description: description,
                        cover_url: coverUrl,
                        audio_url: audioUrl,
                        created_by: user.id
                    }
                ])
                .select()
                .single();
            
            if (error) {
                throw new Error('添加音乐记录失败: ' + error.message);
            }
            
            console.log('音乐添加成功:', data);
            return data;
        } catch (error) {
            console.error('添加音乐时发生错误:', error.message);
            throw error;
        }
    }

    // 添加新视频
    async function addVideo(title, description, thumbnailFile, videoFile, onProgress) {
        try {
            // 验证管理员权限
            await window.App.auth.verifyAdminAccess();
            
            console.log('正在添加新视频:', title);
            
            // 检查是否提供了必需的文件
            if (!videoFile) {
                throw new Error('必须提供视频文件');
            }
            
            // 上传缩略图
            let thumbnailUrl = null;
            if (thumbnailFile) {
                thumbnailUrl = await uploadFile(thumbnailFile, 'images', onProgress);
            }
            
            // 上传视频文件
            let videoUrl = null;
            if (videoFile) {
                videoUrl = await uploadFile(videoFile, 'videos', onProgress);
            }
            
            const { data: { user } } = await window.App.supabase.auth.getUser();
            
            // 插入数据库记录
            const { data, error } = await window.App.supabase
                .from('videos')
                .insert([
                    {
                        title: title,
                        description: description,
                        thumbnail_url: thumbnailUrl,
                        video_url: videoUrl,
                        created_by: user.id
                    }
                ])
                .select()
                .single();
            
            if (error) {
                throw new Error('添加视频记录失败: ' + error.message);
            }
            
            console.log('视频添加成功:', data);
            return data;
        } catch (error) {
            console.error('添加视频时发生错误:', error.message);
            throw error;
        }
    }

    // 将函数添加到全局命名空间
    window.App = window.App || {};
    window.App.admin = {
        checkTableExists,
        checkBucketExists,
        renderMusicManagementTable,
        renderVideoManagementTable,
        showLoading,
        showError,
        showNotification,
        showToast,
        showFilePreview,
        loadMusicManagementData,
        loadVideoManagementData,
        deleteMusic,
        deleteVideo,
        uploadFile,
        addMusic,
        addVideo
    };
})();