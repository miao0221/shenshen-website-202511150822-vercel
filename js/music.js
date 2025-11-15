// 使用IIFE包装避免全局变量污染
(function() {
    // 获取所有音乐数据
    async function fetchMusic() {
        try {
            console.log('正在获取音乐数据...');
            
            const { data, error } = await window.App.supabase
                .from('music')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // 检查是否是因为表不存在导致的错误
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    throw new Error('音乐表不存在，请联系管理员创建数据表');
                }
                throw new Error('获取音乐数据失败: ' + error.message);
            }
            
            console.log('成功获取音乐数据:', data);
            return data;
        } catch (error) {
            console.error('获取音乐数据时发生错误:', error.message);
            throw error;
        }
    }

    // 获取所有音乐数据（用于管理）
    async function fetchMusicForManagement() {
        try {
            // 验证管理员权限
            // 注意：在实际使用中，应该从前端调用处传入验证函数
            console.log('正在获取音乐管理数据...');
            
            const { data, error } = await window.App.supabase
                .from('music')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                // 检查是否是因为表不存在导致的错误
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                    throw new Error('音乐表不存在，请联系管理员创建数据表');
                }
                throw new Error('获取音乐数据失败: ' + error.message);
            }
            
            console.log('成功获取音乐管理数据:', data);
            return data;
        } catch (error) {
            console.error('获取音乐管理数据时发生错误:', error.message);
            throw error;
        }
    }

    // 渲染音乐卡片
    function renderMusicCards(musicData) {
        const container = document.getElementById('music-container');
        
        // 检查数据是否存在
        if (!container) {
            console.error('找不到音乐容器元素');
            return;
        }
        
        // 检查是否有数据
        if (!musicData || musicData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无音乐作品</p>
                    <p class="empty-state-subtitle">敬请期待更多精彩内容</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="media-grid">';
        
        musicData.forEach(music => {
            html += `
            <div class="media-card">
                <img src="${music.cover_url || 'https://placehold.co/300x180/e6f0ff/2c5aa0?text=音乐封面'}" 
                     alt="${music.title}" 
                     class="media-cover" 
                     onerror="this.src='https://placehold.co/300x180/e6f0ff/2c5aa0?text=音乐封面'">
                <div class="media-info">
                    <h3 class="media-title">${music.title}</h3>
                    <p class="media-description">${music.description || '暂无描述'}</p>
                    <button class="play-button" data-id="${music.id}" data-type="music">播放</button>
                </div>
            </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }

    // 播放音乐
    function playMusic(music) {
        // 检查必要元素是否存在
        const musicTitle = document.getElementById('music-title');
        const musicDescription = document.getElementById('music-description');
        const musicCover = document.getElementById('music-cover');
        const audioPlayer = document.getElementById('audio-player');
        const modal = document.getElementById('music-modal');
        
        if (!musicTitle || !musicDescription || !musicCover || !audioPlayer || !modal) {
            console.error('音乐播放器元素缺失');
            alert('页面元素缺失，无法播放音乐');
            return;
        }
        
        // 设置音乐信息
        musicTitle.textContent = music.title;
        musicDescription.textContent = music.description || '暂无描述';
        musicCover.src = music.cover_url || 'https://placehold.co/300x300/e6f0ff/2c5aa0?text=音乐封面';
        musicCover.onerror = function() {
            this.src = 'https://placehold.co/300x300/e6f0ff/2c5aa0?text=音乐封面';
        };
        
        // 设置音频源
        audioPlayer.src = music.audio_url;
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 播放音频
        audioPlayer.load();
    }

    // 将音乐相关函数添加到全局命名空间
    window.App = window.App || {};
    window.App.music = {
        fetchMusic,
        fetchMusicForManagement,
        renderMusicCards,
        playMusic
    };
})();