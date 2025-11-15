// 使用IIFE包装避免全局变量污染
(function() {
    // 页面加载时获取音乐和视频数据
    async function loadMediaData() {
        // 获取并显示音乐数据
        try {
            window.App.admin.showLoading('music-container');
            const musicData = await window.App.music.fetchMusic();
            window.App.music.renderMusicCards(musicData);
        } catch (error) {
            // 检查是否是表不存在的错误
            if (error.message.includes('表不存在')) {
                document.getElementById('music-container').innerHTML = `
                    <div class="empty-state">
                        <p>音乐作品暂未添加</p>
                        <p class="empty-state-subtitle">请管理员添加音乐作品</p>
                    </div>
                `;
            } else {
                window.App.admin.showError('music-container', '获取音乐数据失败: ' + error.message);
            }
        }

        // 获取并显示视频数据
        try {
            window.App.admin.showLoading('videos-container');
            const videoData = await window.App.videos.fetchVideos();
            window.App.videos.renderVideoCards(videoData);
        } catch (error) {
            // 检查是否是表不存在的错误
            if (error.message.includes('表不存在')) {
                document.getElementById('videos-container').innerHTML = `
                    <div class="empty-state">
                        <p>视频作品暂未添加</p>
                        <p class="empty-state-subtitle">请管理员添加视频作品</p>
                    </div>
                `;
            } else {
                window.App.admin.showError('videos-container', '获取视频数据失败: ' + error.message);
            }
        }
        
        // 获取并显示音乐数据（完整页面）
        try {
            window.App.admin.showLoading('music-full-container');
            const musicData = await window.App.music.fetchMusic();
            window.App.music.renderMusicCards(musicData);
        } catch (error) {
            // 检查是否是表不存在的错误
            if (error.message.includes('表不存在')) {
                document.getElementById('music-full-container').innerHTML = `
                    <div class="empty-state">
                        <p>音乐作品暂未添加</p>
                        <p class="empty-state-subtitle">请管理员添加音乐作品</p>
                    </div>
                `;
            } else {
                window.App.admin.showError('music-full-container', '获取音乐数据失败: ' + error.message);
            }
        }

        // 获取并显示视频数据（完整页面）
        try {
            window.App.admin.showLoading('videos-full-container');
            const videoData = await window.App.videos.fetchVideos();
            window.App.videos.renderVideoCards(videoData);
        } catch (error) {
            // 检查是否是表不存在的错误
            if (error.message.includes('表不存在')) {
                document.getElementById('videos-full-container').innerHTML = `
                    <div class="empty-state">
                        <p>视频作品暂未添加</p>
                        <p class="empty-state-subtitle">请管理员添加视频作品</p>
                    </div>
                `;
            } else {
                window.App.admin.showError('videos-full-container', '获取视频数据失败: ' + error.message);
            }
        }
    }

    // 根据认证状态更新UI
    async function updateUIBasedOnAuthState(user) {
        const adminArea = document.getElementById('admin-area');
        const authLink = document.getElementById('auth-link');
        const adminDashboardLink = document.getElementById('admin-dashboard-link'); // 管理后台按钮
        
        if (user) {
            // 用户已登录
            console.log('用户已登录:', user);
            
            // 检查用户是否为管理员
            const isAdmin = await window.App.auth.checkIfAdmin(user.id);
            
            if (isAdmin) {
                // 显示管理员区域和管理后台按钮
                adminArea.style.display = 'block';
                adminDashboardLink.style.display = 'block'; // 显示管理后台按钮
                console.log('管理员权限已确认，显示管理功能');
            } else {
                // 隐藏管理员区域和管理后台按钮
                adminArea.style.display = 'none';
                adminDashboardLink.style.display = 'none'; // 隐藏管理后台按钮
                console.log('当前用户不是管理员，隐藏管理功能');
            }
            
            authLink.textContent = '退出登录';
        } else {
            // 用户未登录
            console.log('用户未登录，隐藏管理功能');
            adminArea.style.display = 'none';
            adminDashboardLink.style.display = 'none'; // 隐藏管理后台按钮
            authLink.textContent = '登录/注册';
        }
    }

    // 处理认证状态变更
    async function handleAuthStateChange(event, session) {
        console.log('认证状态变更事件:', event);
        
        switch (event) {
            case 'SIGNED_IN':
                console.log('用户已登录:', session.user);
                await updateUIBasedOnAuthState(session.user);
                break;
                
            case 'SIGNED_OUT':
                console.log('用户已登出');
                await updateUIBasedOnAuthState(null);
                break;
                
            case 'TOKEN_REFRESHED':
                console.log('用户令牌已刷新:', session.user);
                await updateUIBasedOnAuthState(session.user);
                break;
                
            case 'USER_UPDATED':
                console.log('用户信息已更新:', session.user);
                await updateUIBasedOnAuthState(session.user);
                break;
                
            default:
                console.log('其他认证状态变更:', event);
                await updateUIBasedOnAuthState(session?.user || null);
        }
    }

    // 显示认证模态框
    function showAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    // 隐藏认证模态框
    function hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 切换导航内容
    function switchContent(target) {
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // 显示目标内容区域
        const targetSection = document.getElementById(`${target}-content`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // 更新导航链接的激活状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // 激活当前导航链接
        const activeLink = document.querySelector(`.nav-link[data-target="${target}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // 如果是管理区域，特殊处理
        if (target === 'admin') {
            document.getElementById('admin-area').style.display = 'block';
        }
    }

    // 初始化应用
    async function initApp() {
        // 验证Supabase配置
        console.log('正在验证Supabase配置...');
        const isConfigValid = await window.App.validateSupabaseConfig();
        if (isConfigValid) {
            console.log('Supabase配置验证通过');
        } else {
            console.error('Supabase配置验证失败，请检查配置');
        }
        
        // 添加认证状态监听器
        const { data: authListener } = window.App.auth.onAuthStateChange((event, session) => {
            handleAuthStateChange(event, session);
        });
        
        // 添加播放按钮事件监听器
        document.addEventListener('click', async function(e) {
            if (e.target && e.target.classList.contains('play-button')) {
                const id = e.target.getAttribute('data-id');
                const type = e.target.getAttribute('data-type');
                
                if (type === 'music') {
                    // 获取并播放音乐
                    try {
                        const { data, error } = await window.App.supabase
                            .from('music')
                            .select('*')
                            .eq('id', id)
                            .single();
                        
                        if (error) {
                            throw new Error('获取音乐信息失败: ' + error.message);
                        }
                        
                        window.App.music.playMusic(data);
                    } catch (error) {
                        console.error('播放音乐时出错:', error.message);
                        alert('播放音乐时出错: ' + error.message);
                    }
                } else if (type === 'video') {
                    // 获取并播放视频
                    try {
                        const { data, error } = await window.App.supabase
                            .from('videos')
                            .select('*')
                            .eq('id', id)
                            .single();
                        
                        if (error) {
                            throw new Error('获取视频信息失败: ' + error.message);
                        }
                        
                        window.App.videos.playVideo(data);
                    } catch (error) {
                        console.error('播放视频时出错:', error.message);
                        alert('播放视频时出错: ' + error.message);
                    }
                }
            }
        });
        
        // 管理后台按钮事件处理
        const adminDashboardLink = document.getElementById('admin-dashboard-link');
        if (adminDashboardLink) {
            adminDashboardLink.addEventListener('click', async function(e) {
                e.preventDefault();
                
                try {
                    // 验证管理员权限
                    await window.App.auth.verifyAdminAccess();
                    
                    // 显示管理员区域
                    const adminArea = document.getElementById('admin-area');
                    if (adminArea) {
                        adminArea.style.display = 'block';
                        
                        // 滚动到管理员区域
                        adminArea.scrollIntoView({ behavior: 'smooth' });
                        
                        // 默认加载音乐管理数据
                        window.App.admin.loadMusicManagementData();
                    }
                } catch (error) {
                    // 显示无权限提示
                    alert('无权限访问管理后台: ' + error.message);
                }
            });
        }
        
        // 管理员标签页切换
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', async function() {
                try {
                    // 验证管理员权限
                    await window.App.auth.verifyAdminAccess();
                    
                    const tabName = this.getAttribute('data-tab');
                    
                    // 更新激活的标签
                    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    // 显示对应的内容
                    document.querySelectorAll('.admin-tab-content').forEach(content => {
                        content.classList.remove('active');
                        const contentId = `${tabName}-content`;
                        if (content.id === contentId) {
                            content.classList.add('active');
                        }
                    });
                    
                    // 如果是管理标签页，加载数据
                    if (tabName === 'music-management') {
                        window.App.admin.loadMusicManagementData();
                    } else if (tabName === 'video-management') {
                        window.App.admin.loadVideoManagementData();
                    }
                } catch (error) {
                    // 显示无权限提示
                    alert('无权限访问管理功能: ' + error.message);
                    // 隐藏管理员区域
                    const adminArea = document.getElementById('admin-area');
                    if (adminArea) {
                        adminArea.style.display = 'none';
                    }
                }
            });
        });
        
        // 删除按钮事件处理
        document.addEventListener('click', async function(e) {
            if (e.target && e.target.classList.contains('delete-button')) {
                try {
                    // 验证管理员权限
                    await window.App.auth.verifyAdminAccess();
                    
                    const id = e.target.getAttribute('data-id');
                    const type = e.target.getAttribute('data-type');
                    
                    if (confirm(`确定要删除这个${type === 'music' ? '音乐' : '视频'}吗？`)) {
                        try {
                            if (type === 'music') {
                                await window.App.admin.deleteMusic(id);
                                window.App.admin.showNotification('music-upload-notification', '音乐删除成功', true);
                                // 重新加载音乐管理数据
                                await window.App.admin.loadMusicManagementData();
                                // 重新加载用户界面音乐数据
                                await loadMediaData();
                            } else if (type === 'video') {
                                await window.App.admin.deleteVideo(id);
                                window.App.admin.showNotification('video-upload-notification', '视频删除成功', true);
                                // 重新加载视频管理数据
                                await window.App.admin.loadVideoManagementData();
                                // 重新加载用户界面视频数据
                                await loadMediaData();
                            }
                        } catch (error) {
                            console.error('删除失败:', error.message);
                            if (type === 'music') {
                                window.App.admin.showNotification('music-upload-notification', '删除失败: ' + error.message, false);
                            } else if (type === 'video') {
                                window.App.admin.showNotification('video-upload-notification', '删除失败: ' + error.message, false);
                            }
                        }
                    }
                } catch (error) {
                    // 显示无权限提示
                    alert('无权限执行删除操作: ' + error.message);
                }
            }
        });
        
        // 文件上传区域事件处理
        document.querySelectorAll('.upload-area').forEach(uploadArea => {
            const fileInput = uploadArea.querySelector('.file-input');
            
            // 点击上传区域时触发文件选择
            uploadArea.addEventListener('click', () => {
                fileInput.click();
            });
            
            // 拖拽事件处理
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    // 触发change事件
                    const event = new Event('change', { bubbles: true });
                    fileInput.dispatchEvent(event);
                }
            });
        });
        
        // 添加音乐表单提交处理
        const addMusicForm = document.getElementById('add-music-form');
        if (addMusicForm) {
            addMusicForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    // 验证管理员权限
                    await window.App.auth.verifyAdminAccess();
                    
                    const title = document.getElementById('music-title').value;
                    const description = document.getElementById('music-description').value;
                    const coverFile = document.getElementById('music-cover').files[0];
                    const audioFile = document.getElementById('music-audio').files[0];
                    
                    const submitButton = document.getElementById('submit-music');
                    const originalText = submitButton.textContent;
                    
                    try {
                        // 禁用提交按钮
                        submitButton.disabled = true;
                        submitButton.textContent = '上传中...';
                        
                        // 添加音乐
                        const music = await window.App.admin.addMusic(title, description, coverFile, audioFile);
                        
                        // 显示成功消息
                        window.App.admin.showNotification('music-upload-notification', '音乐添加成功', true);
                        
                        // 重置表单
                        document.getElementById('add-music-form').reset();
                        
                        // 隐藏进度条
                        const progressContainer = document.getElementById('music-upload-progress-container');
                        if (progressContainer) {
                            progressContainer.style.display = 'none';
                        }
                        
                        // 重新加载数据
                        await loadMediaData();
                    } catch (error) {
                        console.error('添加音乐失败:', error.message);
                        window.App.admin.showNotification('music-upload-notification', '添加失败: ' + error.message, false);
                    } finally {
                        // 恢复提交按钮
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }
                } catch (error) {
                    // 显示无权限提示
                    alert('无权限执行添加操作: ' + error.message);
                }
            });
        }
        
        // 添加视频表单提交处理
        const addVideoForm = document.getElementById('add-video-form');
        if (addVideoForm) {
            addVideoForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                try {
                    // 验证管理员权限
                    await window.App.auth.verifyAdminAccess();
                    
                    const title = document.getElementById('video-title').value;
                    const description = document.getElementById('video-description').value;
                    const thumbnailFile = document.getElementById('video-thumbnail').files[0];
                    const videoFile = document.getElementById('video-file').files[0];
                    
                    const submitButton = document.getElementById('submit-video');
                    const originalText = submitButton.textContent;
                    
                    try {
                        // 禁用提交按钮
                        submitButton.disabled = true;
                        submitButton.textContent = '上传中...';
                        
                        // 添加视频
                        const video = await window.App.admin.addVideo(title, description, thumbnailFile, videoFile);
                        
                        // 显示成功消息
                        window.App.admin.showNotification('video-upload-notification', '视频添加成功', true);
                        
                        // 重置表单
                        document.getElementById('add-video-form').reset();
                        
                        // 隐藏进度条
                        const progressContainer = document.getElementById('video-upload-progress-container');
                        if (progressContainer) {
                            progressContainer.style.display = 'none';
                        }
                        
                        // 重新加载数据
                        await loadMediaData();
                    } catch (error) {
                        console.error('添加视频失败:', error.message);
                        window.App.admin.showNotification('video-upload-notification', '添加失败: ' + error.message, false);
                    } finally {
                        // 恢复提交按钮
                        submitButton.disabled = false;
                        submitButton.textContent = originalText;
                    }
                } catch (error) {
                    // 显示无权限提示
                    alert('无权限执行添加操作: ' + error.message);
                }
            });
        }
        
        // 添加模态框关闭事件监听器
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                const modal = this.closest('.media-modal');
                window.App.utils.closeModal(modal.id);
            });
        });
        
        // 点击模态框外部区域关闭模态框
        document.querySelectorAll('.media-modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    window.App.utils.closeModal(this.id);
                }
            });
        });
        
        // 添加认证相关事件监听器
        // 登录/注册链接点击事件
        const authLink = document.getElementById('auth-link');
        if (authLink) {
            authLink.addEventListener('click', function(e) {
                e.preventDefault();
                const text = authLink.textContent;
                if (text === '退出登录') {
                    // 执行登出操作
                    window.App.auth.signOut();
                } else {
                    // 显示认证模态框
                    showAuthModal();
                }
            });
        }
        
        // 认证模态框关闭按钮事件
        const closeModal = document.querySelector('.auth-modal .close');
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                hideAuthModal();
            });
        }
        
        // 点击模态框外部区域关闭模态框
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    hideAuthModal();
                }
            });
        }
        
        // 认证标签页切换
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // 更新激活的标签
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // 显示对应的表单
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                    if (form.id === `${tabName}-form`) {
                        form.classList.add('active');
                    }
                });
            });
        });
        
        // 登录表单提交处理
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                const errorMessage = document.getElementById('auth-error-message');
                
                try {
                    // 清除之前的错误信息
                    if (errorMessage) {
                        errorMessage.textContent = '';
                        errorMessage.style.display = 'none';
                    }
                    
                    // 执行登录
                    await window.App.auth.signIn(email, password);
                    
                    // 隐藏模态框
                    hideAuthModal();
                    
                    // 重置表单
                    loginForm.reset();
                } catch (error) {
                    console.error('登录失败:', error.message);
                    if (errorMessage) {
                        errorMessage.textContent = error.message;
                        errorMessage.style.display = 'block';
                    }
                }
            });
        }
        
        // 注册表单提交处理
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const errorMessage = document.getElementById('auth-error-message');
                
                try {
                    // 清除之前的错误信息
                    if (errorMessage) {
                        errorMessage.textContent = '';
                        errorMessage.style.display = 'none';
                    }
                    
                    // 执行注册
                    await window.App.auth.signUp(email, password);
                    
                    // 隐藏模态框
                    hideAuthModal();
                    
                    // 重置表单
                    registerForm.reset();
                    
                    // 显示成功消息（可选）
                    alert('注册成功！请检查您的邮箱以确认账户。');
                } catch (error) {
                    console.error('注册失败:', error.message);
                    if (errorMessage) {
                        errorMessage.textContent = error.message;
                        errorMessage.style.display = 'block';
                    }
                }
            });
        }
        
        // 导航链接点击事件
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = this.getAttribute('data-target');
                switchContent(target);
            });
        });
        
        // 汉堡菜单点击事件
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
            });
        }
        
        // 点击导航链接后关闭移动端菜单
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (navLinks) {
                    navLinks.classList.remove('active');
                }
            });
        });
        
        // 页面加载完成后立即获取数据
        loadMediaData();
        
        // 默认显示首页内容
        switchContent('home');
    }

    // 确保DOM加载完成后初始化应用
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM已经加载完成
        initApp();
    }

    // 将初始化函数添加到全局命名空间
    window.App = window.App || {};
    window.App.initApp = initApp;
})();