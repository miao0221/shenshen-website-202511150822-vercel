// 使用IIFE包装避免全局变量污染
(function() {
    // 获取所有视频数据
    async function fetchVideos() {
        try {
            console.log('正在获取视频数据...');
            
            const { data, error } = await window.App.supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // 检查是否是因为表不存在导致的错误
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    throw new Error('视频表不存在，请联系管理员创建数据表');
                }
                throw new Error('获取视频数据失败: ' + error.message);
            }
            
            console.log('成功获取视频数据:', data);
            return data;
        } catch (error) {
            console.error('获取视频数据时发生错误:', error.message);
            throw error;
        }
    }

    // 获取所有视频数据（用于管理）
    async function fetchVideosForManagement() {
        try {
            // 验证管理员权限
            // 注意：在实际使用中，应该从前端调用处传入验证函数
            console.log('正在获取视频管理数据...');
            
            const { data, error } = await window.App.supabase
                .from('videos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // 检查是否是因为表不存在导致的错误
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    throw new Error('视频表不存在，请联系管理员创建数据表');
                }
                throw new Error('获取视频数据失败: ' + error.message);
            }
            
            console.log('成功获取视频管理数据:', data);
            return data;
        } catch (error) {
            console.error('获取视频管理数据时发生错误:', error.message);
            throw error;
        }
    }

    // 渲染视频卡片
    function renderVideoCards(videoData) {
        const container = document.getElementById('videos-container');
        
        // 检查数据是否存在
        if (!container) {
            console.error('找不到视频容器元素');
            return;
        }
        
        // 检查是否有数据
        if (!videoData || videoData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无视频作品</p>
                    <p class="empty-state-subtitle">敬请期待更多精彩内容</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="media-grid">';
        
        videoData.forEach(video => {
            html += `
            <div class="media-card">
                <img src="${video.thumbnail_url || 'https://placehold.co/300x180/e6f0ff/2c5aa0?text=视频缩略图'}" 
                     alt="${video.title}" 
                     class="media-cover" 
                     onerror="this.src='https://placehold.co/300x180/e6f0ff/2c5aa0?text=视频缩略图'">
                <div class="media-info">
                    <h3 class="media-title">${video.title}</h3>
                    <p class="media-description">${video.description || '暂无描述'}</p>
                    <button class="play-button" data-id="${video.id}" data-type="video">播放</button>
                </div>
            </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 播放视频
    function playVideo(video) {
        // 检查必要元素是否存在
        const videoTitle = document.getElementById('video-title');
        const videoDescription = document.getElementById('video-description');
        const videoPlayer = document.getElementById('video-player');
        const modal = document.getElementById('video-modal');
        
        if (!videoTitle || !videoDescription || !videoPlayer || !modal) {
            console.error('视频播放器元素缺失');
            alert('页面元素缺失，无法播放视频');
            return;
        }
        
        // 设置视频信息
        videoTitle.textContent = video.title;
        videoDescription.textContent = video.description || '暂无描述';
        
        // 设置视频源
        videoPlayer.src = video.video_url;
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 播放视频
        videoPlayer.load();
    }

    // 将视频相关函数添加到全局命名空间
    window.App = window.App || {};
    window.App.videos = {
        fetchVideos,
        fetchVideosForManagement,
        renderVideoCards,
        playVideo
    };
})();