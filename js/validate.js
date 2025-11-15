// Supabase配置验证脚本
// 使用IIFE包装避免全局变量污染
(function() {
    // 验证Supabase配置的独立函数
    async function runValidation() {
        console.log('开始验证Supabase配置...');
        
        try {
            // 检查window.App是否存在
            if (!window.App || !window.App.supabase) {
                console.error('错误: Supabase客户端未正确初始化');
                return false;
            }
            
            const supabase = window.App.supabase;
            
            // 1. 测试数据库连接
            console.log('1. 测试数据库连接...');
            // 使用简单的查询代替无效的RPC调用
            const { data: test_data, error: test_error } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);
            
            if (test_error) {
                console.log('   数据库连接测试失败:', test_error.message);
            } else {
                console.log('   数据库连接成功');
            }
            
            // 2. 检查必需的表是否存在
            console.log('2. 检查必需的数据表...');
            
            // 检查profiles表
            try {
                const { data: profiles_data, error: profiles_error } = await supabase
                    .from('profiles')
                    .select('id')
                    .limit(1);
                
                if (profiles_error) {
                    console.log('   profiles表不存在或无法访问:', profiles_error.message);
                } else {
                    console.log('   profiles表存在且可访问');
                }
            } catch (e) {
                console.log('   profiles表检查失败:', e.message);
            }
            
            // 检查music表
            try {
                const { data: music_data, error: music_error } = await supabase
                    .from('music')
                    .select('id')
                    .limit(1);
                
                if (music_error) {
                    console.log('   music表不存在或无法访问:', music_error.message);
                } else {
                    console.log('   music表存在且可访问');
                }
            } catch (e) {
                console.log('   music表检查失败:', e.message);
            }
            
            // 检查videos表
            try {
                const { data: videos_data, error: videos_error } = await supabase
                    .from('videos')
                    .select('id')
                    .limit(1);
                
                if (videos_error) {
                    console.log('   videos表不存在或无法访问:', videos_error.message);
                } else {
                    console.log('   videos表存在且可访问');
                }
            } catch (e) {
                console.log('   videos表检查失败:', e.message);
            }
            
            // 3. 检查认证状态
            console.log('3. 检查认证状态...');
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log('   当前用户已登录:', user.email);
                
                // 检查是否为管理员
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', user.id)
                        .single();
                    
                    if (!profileError && profile && profile.is_admin) {
                        console.log('   当前用户是管理员');
                    } else if (!profileError && profile) {
                        console.log('   当前用户不是管理员');
                    } else if (profileError) {
                        console.log('   获取用户权限信息失败:', profileError.message);
                    }
                } catch (e) {
                    console.log('   检查用户权限时出错:', e.message);
                }
            } else {
                console.log('   当前未登录');
            }
            
            // 4. 检查存储桶
            console.log('4. 检查存储桶...');
            try {
                const { data: buckets, error: bucketError } = await supabase
                    .storage
                    .listBuckets();
                
                if (bucketError) {
                    console.log('   存储桶检查失败:', bucketError.message);
                } else {
                    const musicBucket = buckets.find(b => b.name === 'music');
                    const videosBucket = buckets.find(b => b.name === 'videos');
                    
                    if (musicBucket) {
                        console.log('   music存储桶存在');
                    } else {
                        console.log('   music存储桶不存在');
                    }
                    
                    if (videosBucket) {
                        console.log('   videos存储桶存在');
                    } else {
                        console.log('   videos存储桶不存在');
                    }
                }
            } catch (e) {
                console.log('   存储桶检查失败:', e.message);
            }
            
            console.log('验证完成');
            return true;
        } catch (error) {
            console.error('验证过程中发生错误:', error.message);
            return false;
        }
    }
    
    // 添加到全局命名空间
    window.App = window.App || {};
    window.App.runValidation = runValidation;
    
    // 如果在开发环境中，可以自动运行验证
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // 延迟执行以确保所有资源加载完成
        setTimeout(() => {
            runValidation();
        }, 2000);
    }
    
    console.log('Supabase验证脚本已加载。在控制台运行 App.runValidation() 来手动验证配置。');
})();