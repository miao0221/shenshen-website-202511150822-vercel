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

    // 检查存储桶是否存在
    async function checkBucketExists(bucketName) {
        try {
            console.log(`正在检查存储桶是否存在: ${bucketName}`);
            
            // 获取存储桶列表
            const { data: buckets, error: listError } = await window.App.supabase.storage.listBuckets();
            
            if (listError) {
                console.error('获取存储桶列表失败:', listError.message);
                throw new Error('获取存储桶列表失败: ' + listError.message);
            }
            
            // 检查存储桶是否存在
            const bucketExists = buckets.some(bucket => bucket.name === bucketName);
            
            if (!bucketExists) {
                throw new Error(`存储桶 "${bucketName}" 不存在，请在 Supabase 后台创建该存储桶`);
            }
            
            console.log(`存储桶 ${bucketName} 存在`);
            return true;
        } catch (error) {
            console.error('检查存储桶时发生错误:', error.message);
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
        loadMusicManagementData,
        loadVideoManagementData,
        deleteMusic,
        deleteVideo,
        uploadFile,
        addMusic,
        addVideo
    };
})();